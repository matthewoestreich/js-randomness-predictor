#!/usr/bin/python3

#
#
#
#
#
# HUGE SHOUT OUT TO https://github.com/phvietan/jsc-randomness-predictor/tree/main
#
#
#
#
#

import z3
import math

def round(val):
    f = math.floor(val)
    c = math.ceil(val)
    if (abs(f-val) < abs(val-c)):
        return f
    return c

sequence = [
0.7922919822649137,
0.13639808227068018,
0.9543189341733138,
0.9199276258943443,
]

guessNext = 10

solver = z3.Solver()
se_state0, se_state1 = z3.BitVecs("se_state0 se_state1", 64)

for i in range(len(sequence)):
    # In JSC, the shift right is shift right, not logical shift right
    se_s1 = se_state0     # x = m_low
    se_s0 = se_state1     # y = m_high
    se_state0 = se_s0     # m_low = y
    se_s1 ^= se_s1 << 23  # x ^= x << 23
    se_s1 ^= se_s1 >> 17  # x ^= x >> 17
    se_s1 ^= se_s0        # x ^= y
    se_s1 ^= se_s0 >> 26  # x ^= y >> 26
    se_state1 = se_s1     # m_high = x


    sum = se_state1 + se_state0
    sum = sum & ((1 << 53) - 1)
    float_64_val = round(sequence[i] * (1<<53))

    # Compare value
    solver.add(sum == float_64_val)

print("Checking SAT solver")
if solver.check() == z3.sat:
    model = solver.model()

    states = {}
    for state in model.decls():
        states[state.__str__()] = model[state]

    state0 = states["se_state0"].as_long()
    state1 = states["se_state1"].as_long()

    print("Solved !!! Found m_low=%d and m_high=%d" % (state0, state1))
    # Use C++ because the math is calculated in int64_t, and it's convenient because I copy paste from JSC source.
    import os
    os.system('c++ ./solve.cpp -o main && ./main %d %d %d %d && rm main' % (state0, state1, len(sequence), guessNext))

else:
    print("Could not solve! Sad solved!!!")