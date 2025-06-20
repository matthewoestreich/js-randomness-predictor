#include "V8PredictorWrapper.hpp"

Napi::Object V8PredictorWrapper::Init(Napi::Env env, Napi::Object exports) {
  Napi::Function func =
      DefineClass(env, "V8Predictor", {InstanceMethod("predictNext", &V8PredictorWrapper::PredictNext)});

  exports.Set("V8Predictor", func);
  return exports;
}

V8PredictorWrapper::V8PredictorWrapper(const Napi::CallbackInfo &info) : Napi::ObjectWrap<V8PredictorWrapper>(info) {
  Napi::Env env = info.Env();

  if (!info[0].IsArray()) {
    Napi::TypeError::New(env, "Expected an array of numbers").ThrowAsJavaScriptException();
    return;
  }

  Napi::Array input = info[0].As<Napi::Array>();
  std::vector<double> values;
  for (uint32_t i = 0; i < input.Length(); ++i) {
    Napi::Value val = input[i];
    if (!val.IsNumber()) {
      Napi::TypeError::New(env, "Array must contain only numbers").ThrowAsJavaScriptException();
      return;
    }
    values.push_back(val.As<Napi::Number>().DoubleValue());
  }

  predictor = std::make_unique<V8Predictor>(values);
}

Napi::Value V8PredictorWrapper::PredictNext(const Napi::CallbackInfo &info) {
  double prediction = predictor->predictNext();
  return Napi::Number::New(info.Env(), prediction);
}
