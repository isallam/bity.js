#ifndef _OBJYACCESS_H_
#define _OBJYACCESS_H_

#include <string>
#include <list>
#include <nan.h>
#include <ooObjy.h>
#include <objy/db/Connection.h>
#include <objy/db/Transaction.h>
#include <objy/data/Data.h>
#include <objy/statement/Statement.h>
#include <objy/policy/Policies.h>
#include <objy/expression/language/LanguageRegistry.h>
#include <objy/Exception.h>

using namespace std;

class ObjyAccess : public Nan::ObjectWrap {
 public:
  static void Init(v8::Local<v8::Object> exports);

 private:
  explicit ObjyAccess(string connectionString);
  ~ObjyAccess();
  void doQueryTest(const char* queryString);
  static void reportError(v8::Local<v8::Function> cb, const char* errorMessage);
  static void processOid(ooId& oid, int maxResults, v8::Local<v8::Function>& cb);
  
  static void New(const Nan::FunctionCallbackInfo<v8::Value>& info);
  static void GetConnection(const Nan::FunctionCallbackInfo<v8::Value>& info);
  static void Query(const Nan::FunctionCallbackInfo<v8::Value>& info);
  static void sendResults(v8::Local<v8::Function>& cb, list<string>& resList);

  static void Update(const Nan::FunctionCallbackInfo<v8::Value>& info);
  static void GetObject(const Nan::FunctionCallbackInfo<v8::Value>& info);
  static void GetEdges(const Nan::FunctionCallbackInfo<v8::Value>& info);
  static void GetGroupEdges(const Nan::FunctionCallbackInfo<v8::Value>& info);
  static void GetData(const Nan::FunctionCallbackInfo<v8::Value>& info);
  static Nan::Persistent<v8::Function> constructor;
  
  string _connectionString;
  objy::db::Connection* _connection;
};

#endif
