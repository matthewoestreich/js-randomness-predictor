#pragma once

#include <z3++.h>

class V8Predictor {
public:
  V8Predictor(const std::vector<double> &sequence);
  double predictNext();

private:
  std::vector<double> sequence;
  uint64_t cState0;
  uint64_t cState1;
  z3::context context;
  z3::solver solver;
  z3::expr sState0;
  z3::expr sState1;

  void xorShift128PlusSymbolic();
  uint64_t xorShift128PlusConcrete();
  uint64_t recoverMantissa(double value);
  double toDouble(uint64_t value);
};
