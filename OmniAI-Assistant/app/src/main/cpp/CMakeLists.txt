cmake_minimum_required(VERSION 3.22.1)
project("omniainative")

set(CMAKE_CXX_STANDARD 17)

set(LLAMA_CPP_DIR ${CMAKE_CURRENT_SOURCE_DIR}/llama.cpp)
set(STB_DIR ${CMAKE_CURRENT_SOURCE_DIR}/stb)

add_library(omniainative SHARED
        omniainative.cpp
)

target_include_directories(omniainative PRIVATE
        ${LLAMA_CPP_DIR}/include
        ${LLAMA_CPP_DIR}/ggml/include
        ${STB_DIR}
)

target_link_libraries(omniainative
        android
        log
)
