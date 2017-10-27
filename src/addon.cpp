#include <nan.h>
#include "objyAccess.h"

static void shutdown(void*) {
  //ooObjy::shutdown();
  printf("Shutting down!!!!");
}

void Init(v8::Local<v8::Object> exports) {
  
  ObjyAccess::Init(exports);
  ooObjy::startup();
  node::AtExit(shutdown);
}

NODE_MODULE(addon, Init)
