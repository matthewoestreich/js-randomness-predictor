/**
 * 
 * 
 * 
 *
 *
 *
 * HUGE SHOUT OUT TO https://github.com/phvietan/jsc-randomness-predictor/tree/main
 * 
 *
 *
 *
 * 
 * 
 * 
**/

#include <stdint.h>
#include <cstdio>
#include <cstdlib>
#include <cstring>

int64_t m_low;
int64_t m_high;
unsigned m_seed;

int64_t advance() {
  int64_t x = m_low;
  int64_t y = m_high;
  m_low = y;
  x ^= x << 23;
  x ^= x >> 17;
  x ^= y ^ (y >> 26);
  m_high = x;
  return m_high + m_low;
}

double get() {
  int64_t value = advance() & ((1ULL << 53) - 1);
  return value * (1.0 / (1ULL << 53));
}

// solve with input m_low and m_high
int main(int argc, char** argv) {
  if (argc != 5) {
    puts("err, args must be 4");
    return 1;
  }

  for (int i = 0; i < strlen(argv[1]); ++i) {
    m_low = m_low * 10 + argv[1][i] - '0';
  }
  for (int i = 0; i < strlen(argv[2]); ++i) {
    m_high = m_high * 10 + argv[2][i] - '0';
  }

  printf("m_low=%s; m_high=%s\n", argv[1], argv[2]);
  printf("Parsed to int64_t: m_low=%lld; m_high=%lld\n", m_low, m_high);
  puts("=======================");

  int lenFirst = atoi(argv[3]);
  int lenGuess = atoi(argv[4]);

  puts("Math.random input vals");
  for (int i = 0; i < lenFirst; ++i) {
    double k = get();
    printf("%.12lf\n", k);
  }
  puts("=======================");
  puts("Math.random next guess vals");
  for (int i = 0; i < lenGuess; ++i) {
    double k = get();
    printf("%.12lf\n", k);
  }

  return 0;
}