##### Options which a user might set before building go here #####

PREFIX ?= $(HOME)/.idris2sh

# clang compiles the output much faster than gcc!
CC := clang

##################################################################

RANLIB ?= ranlib
AR ?= ar

CFLAGS := -Wall $(CFLAGS)
LDFLAGS := $(LDFLAGS)

MACHINE := $(shell $(CC) -dumpmachine)
ifneq (,$(findstring cygwin, $(MACHINE)))
	OS := windows
	SHLIB_SUFFIX := .dll
else ifneq (,$(findstring mingw, $(MACHINE)))
	OS := windows
	SHLIB_SUFFIX := .dll
else ifneq (,$(findstring windows, $(MACHINE)))
	OS := windows
	SHLIB_SUFFIX := .dll
else ifneq (,$(findstring darwin, $(MACHINE)))
	OS := darwin
	SHLIB_SUFFIX := .dylib
	CFLAGS += -fPIC
else ifneq (, $(findstring bsd, $(MACHINE)))
	OS := bsd
	SHLIB_SUFFIX := .so
	CFLAGS += -fPIC
else
        OS := linux
        SHLIB_SUFFIX := .so
        CFLAGS += -fPIC
endif

ifeq ($(OS),bsd)
	MAKE := gmake
else
	MAKE := make
endif
