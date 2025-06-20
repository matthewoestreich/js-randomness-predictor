#pragma once

#include "V8Predictor.hpp"
#include <napi.h>

class V8PredictorWrapper : public Napi::ObjectWrap<V8PredictorWrapper> {
public:
  static Napi::Object Init(Napi::Env env, Napi::Object exports);
  V8PredictorWrapper(const Napi::CallbackInfo &info);

private:
  Napi::Value PredictNext(const Napi::CallbackInfo &info);

  std::unique_ptr<V8Predictor> predictor;
};
