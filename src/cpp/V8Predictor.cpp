#include "V8Predictor.hpp"

#include <z3++.h>

V8Predictor::V8Predictor(const std::vector<double> &sequence)
    : context(), solver(context), sState0(context.bv_const("se_state0", 64)),
      sState1(context.bv_const("se_state1", 64)) {
  this->sequence = sequence;
  reverse(this->sequence.begin(), this->sequence.end());

  for (double observed : this->sequence) {
    xorShift128PlusSymbolic();
    uint64_t mantissa = recoverMantissa(observed + 1);
    solver.add(context.bv_val(mantissa, 64) == lshr(sState0, 12));
  }

  if (solver.check() != z3::sat) {
    throw std::runtime_error("UNSAT");
  }

  z3::model model = solver.get_model();
  cState0 = model.eval(sState0).as_uint64();
  cState1 = model.eval(sState1).as_uint64();

  // We need to get concrete state up to symbolic state..
  for (size_t i = 0; i < this->sequence.size(); ++i) {
    xorShift128PlusConcrete();
  }
}

double V8Predictor::predictNext() {
  return toDouble(xorShift128PlusConcrete());
}

void V8Predictor::xorShift128PlusSymbolic() {
  z3::expr s1 = sState0;
  z3::expr s0 = sState1;
  s1 = s1 ^ z3::shl(s1, 23);
  s1 = s1 ^ z3::lshr(s1, 17);
  s1 = s1 ^ s0;
  s1 = s1 ^ z3::lshr(s0, 26);
  sState0 = sState1;
  sState1 = s1;
}

/**
 * Performs the concrete XOR backwards due to how V8 provides random numbers.
 */
uint64_t V8Predictor::xorShift128PlusConcrete() {
  uint64_t result = cState0;
  uint64_t ps1 = cState0;
  uint64_t ps0 = cState1 ^ (cState0 >> 26);
  ps0 = ps0 ^ cState0;
  ps0 = ps0 ^ (ps0 >> 17) ^ (ps0 >> 34) ^ (ps0 >> 51);
  ps0 = (ps0 ^ (ps0 << 23) ^ (ps0 << 46));
  cState0 = ps0;
  cState1 = ps1;
  return result;
}

uint64_t V8Predictor::recoverMantissa(double value) {
  return std::bit_cast<uint64_t>(value) & ((1ULL << 52) - 1);
}

double V8Predictor::toDouble(uint64_t value) {
  return std::bit_cast<double>((value >> 12) | 0x3FF0000000000000) - 1;
}
