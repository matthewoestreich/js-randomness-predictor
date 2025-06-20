cmake_minimum_required(VERSION 4.0)
project(js-randomness-predictor VERSION 1.0 LANGUAGES CXX)
set(CMAKE_POLICY_VERSION 3.21)

set(CMAKE_CXX_STANDARD 23)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_EXPORT_COMPILE_COMMANDS ON)

add_compile_options(-Wall -Wextra -Wpedantic)

# Fetch Z3
include(FetchContent)
FetchContent_Declare(
  z3
  GIT_REPOSITORY https://github.com/Z3Prover/z3.git
  GIT_TAG z3-4.15.1
)
set(Z3_BUILD_PYTHON_BINDINGS OFF CACHE BOOL "" FORCE)
set(Z3_BUILD_EXECUTABLE OFF CACHE BOOL "" FORCE)
FetchContent_MakeAvailable(z3)

if(DEFINED CMAKE_JS_PATH AND CMAKE_JS_PATH)
  include(${CMAKE_JS_PATH})
endif()

# Source files
file(GLOB_RECURSE CPP_SOURCES CONFIGURE_DEPENDS
  ${CMAKE_SOURCE_DIR}/src/cpp/*.cpp
)

# Node-API native addon
add_library(JSRandomnessPredictor SHARED ${CPP_SOURCES})

message("CMAKE_JS_INC= ${CMAKE_JS_INC}")

# Z3/Node headers
target_include_directories(JSRandomnessPredictor
  PRIVATE
    ${CMAKE_JS_INC}
    ${CMAKE_SOURCE_DIR}/src/cpp
    ${CMAKE_SOURCE_DIR}/node_modules/node-addon-api
    ${z3_SOURCE_DIR}/src/api/c++
)

add_definitions(-DNAPI_VERSION=9)

# Link against Node and Z3
target_link_libraries(JSRandomnessPredictor
  PRIVATE
    ${CMAKE_JS_LIB}
    libz3
)

# This is required for Node.js native addons to be `.node` files
set_target_properties(JSRandomnessPredictor PROPERTIES PREFIX "" SUFFIX ".node")
