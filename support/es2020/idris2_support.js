function js2idris(x) {
  if (typeof x === 'undefined') {
    return undefined;
  }
  if (typeof x === 'number') {
    return BigInt(x);
  }
  if (typeof x === 'bigint') {
    return x;
  }
  if (typeof x === 'string') {
    return x;
  }
  if (x.length !== undefined && typeof x.slice === 'function') {
    return js2idris_array(x);
  }
  console.error("do not know how to convert object from JS to Idris:", x);
  return x;
}

function js2idris_array(a) {
  console.log("convert: ", a);
  if (a.length === 0) {
    return [0];
  } else {
    return [1, js2idris(a[0]), js2idris_array(a.slice(1))];
  }
}

const fs = require('fs');

// IO
exports.idris2_putStr = (str, _world) => {
  console.log(str);
};

// System
exports.idris2_getArgs = () => {
  return js2idris(process.argv.slice(1));
};
exports.idris2_getEnv = (name, _world) => {
  return js2idris(process.env[name]);
};

// mutable var to store last error
let __errno = null;
exports.idris2_fileErrno = (_world) => {
  if (__errno !== null) {
    const real_errno = __errno.errno;
    return js2idris(-real_errno);
  }
  return js2idris(0);
};

// System.Directory
exports.idris2_changeDir = (dir, _world) => {
  try {
    process.chdir(dir);
    __errno = null;
    return js2idris(0);
  } catch (e) {
    __errno = e;
    return js2idris(1);
  }
};
exports.idris2_currentDirectory = (_world) => {
  return js2idris(process.cwd());
};
exports.idris2_createDir = (dir, _world) => {
  throw new Error("not implemented");
};
exports.idris2_dirOpen = (dir, _world) => {
  throw new Error("not implemented");
};
exports.idris2_dirClose = (dir, _world) => {
  throw new Error("not implemented");
};
exports.idris2_rmDir = (dir, _world) => {
  throw new Error("not implemented");
};
exports.idris2_nextDirEntry = (dir, _world) => {
  throw new Error("not implemented");
};

function FilePtr(fd) {
  this.fd = fd;
  return this;
}

// System.File
exports.idris2_openFile = (name, mode, _world) => {
  try {
    const fd = fs.openSync(name, mode);
    __errno = null;
    return new FilePtr(fd);
  } catch (e) {
    __errno = e;
    return undefined;
  }
};

exports.idris2_closeFile = (filePtr, _world) => {
  try {
    const fd = filePtr.fd;
    fs.closeSync(fd);
    __errno = null;
  } catch (e) {
    __errno = e;
  }
  return undefined;
};

const bufferFuncsLE = {
  readInt64: (buf, offset) => buf.readBigInt64LE(offset),
  readInt32: (buf, offset) => buf.readInt32LE(offset),
  readDouble: (buf, offset) => buf.readDoubleLE(offset),

  writeInt64: (buf, offset, val) => buf.writeBigInt64LE(offset, val),
  writeInt32: (buf, offset, val) => buf.writeInt32LE(offset, val),
  writeDouble: (buf, offset, val) => buf.writeDoubleLE(offset, val),
};
const bufferFuncs = bufferFuncsLE;

// Data.Buffer
exports.idris2_bufferFromFile = (filename, _world) => {
  try {
    return fs.readFileSync(filename);
  } catch (e) {
  }
  return undefined;
};
exports.idris2_isBuffer = (buf) => {
  if (buf !== undefined) {
    return js2idris(0);
  } else {
    return js2idris(1);
  }
};
exports.idris2_bufferSize = (buf) => {
  return js2idris(buf.length);
};

exports.idris2_bufferGetInt = (buf, offset, _world) => {
  return js2idris(bufferFuncs.readInt64(buf, Number(offset)));
};
exports.idris2_bufferGetInt32 = (buf, offset, _world) => {
  return js2idris(bufferFuncs.readInt32(buf, Number(offset)));
};
exports.idris2_bufferGetDouble = (buf, offset, _world) => {
  // careful: do not convert double to BigInt!
  return bufferFuncs.readDouble(buf, Number(offset));
};
exports.idris2_bufferGetByte = (buf, offset, _world) => {
  return js2idris(buf.readUInt8(Number(offset)));
};
exports.idris2_bufferGetString = (buf, offset, length, _world) => {
  return buf.slice(Number(offset), Number(offset + length)).toString('utf-8');
};

exports.idris2_bufferCopyData = (srcBuf, srcOffset, length, destBuf, destOffset, _world) => {
  srcBuf.copy(destBuf, Number(destOffset), Number(srcOffset), Number(srcOffset + length));
  return undefined;
};

exports.idris2_newBuffer = (size, _world) => {
  return Buffer.alloc(Number(size));
};


// AnyPtr
exports.idris2_isNull = (ptr) => {
  if (ptr === null || ptr === undefined) {
    return BigInt(1);
  }
  return BigInt(0);
};
exports.idris2_getString = (ptr) => {
  return ptr;
};
