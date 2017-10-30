#include "objyAccess.h"


Nan::Persistent<v8::Function> ObjyAccess::constructor;

ObjyAccess::ObjyAccess(string connectionString) : 
    _connectionString(connectionString) {
  _connection = objy::db::Connection::connect(connectionString.c_str());
}

ObjyAccess::~ObjyAccess() {
}

void ObjyAccess::Init(v8::Local<v8::Object> exports) {
  Nan::HandleScope scope;

  // Prepare constructor template
  v8::Local<v8::FunctionTemplate> tpl = Nan::New<v8::FunctionTemplate>(New);
  tpl->SetClassName(Nan::New("ObjyAccess").ToLocalChecked());
  tpl->InstanceTemplate()->SetInternalFieldCount(1);

  // Prototype
  Nan::SetPrototypeMethod(tpl, "connection", GetConnection);
  Nan::SetPrototypeMethod(tpl, "query", Query);

  constructor.Reset(tpl->GetFunction());
  exports->Set(Nan::New("ObjyAccess").ToLocalChecked(), tpl->GetFunction());
  
}

void ObjyAccess::New(const Nan::FunctionCallbackInfo<v8::Value>& info) {

  v8::Isolate* isolate = info.GetIsolate();

  if (info.IsConstructCall()) {
    // Invoked as constructor: `new ObjyAccess(...)`
    //double value = info[0]->IsUndefined() ? 0 : info[0]->NumberValue();
    if (info[0]->IsString()) {
      v8::String::Utf8Value str(info[0]->ToString());
      string connection_str = (const char*)(*str);
      //printf("Connection to: [%s]\n", connection_str.c_str());
      ObjyAccess* obj = new ObjyAccess(connection_str);
      obj->Wrap(info.This());
      info.GetReturnValue().Set(info.This());
    } else {
      isolate->ThrowException(v8::Exception::TypeError(
        v8::String::NewFromUtf8(isolate, "Missing string for boot file path.")));
      return;

    }
  } else {
    // Invoked as plain function `ObjyAccess(...)`, turn into construct call.
    const int argc = 1;
    v8::Local<v8::Value> argv[argc] = { info[0] };
    v8::Local<v8::Function> cons = Nan::New<v8::Function>(constructor);
    info.GetReturnValue().Set(cons->NewInstance(argc, argv));
  }
}

void ObjyAccess::GetConnection(const Nan::FunctionCallbackInfo<v8::Value>& info) {
  ObjyAccess* obj = ObjectWrap::Unwrap<ObjyAccess>(info.Holder());
  info.GetReturnValue().Set(Nan::New(obj->_connectionString.c_str()).ToLocalChecked());
  //info.GetReturnValue().Set(Nan::New("Blah Blah").ToLocalChecked());
}

void ObjyAccess::Query(const Nan::FunctionCallbackInfo<v8::Value>& info) {

  v8::Isolate* isolate = info.GetIsolate();
  ObjyAccess* obj = ObjectWrap::Unwrap<ObjyAccess>(info.Holder());
  string qString;
  v8::Local<v8::Function> cb;
  int maxResults = -1;
  
  if (info[0]->IsString())
  {
    v8::String::Utf8Value queryString(info[0]->ToString());
    printf("Got query string: %s\n", (const char*)(*queryString));
    qString = (const char*)(*queryString);
    //obj->doQuery((const char*)(*queryString));
  }
  else {
    isolate->ThrowException(v8::Exception::TypeError(
      v8::String::NewFromUtf8(isolate, "Missing valid query string.")));
    return;
  }
  if (info.Length() > 2) {
    maxResults = info[1]->NumberValue();
    cb = info[2].As<v8::Function>();
  }
  else {
    cb = info[1].As<v8::Function>();
  }
  const int argc = 1;
  
  try {
      //printf("Executing Query: '%s'\n", qString);
      objy::db::Transaction* tx = new objy::db::Transaction(objy::db::OpenMode::ReadOnly, "read");
      //const objy::expression::language::Language* lang = objy::expression::language::LanguageRegistry::lookupLanguage("DO");
      //objy::expression::ExpressionTreeHandle eHandle = lang->parse(queryString);
      //eHandle->addRef();
      objy::statement::Statement doStatement(/*eHandle */ qString.c_str());

      // Add the identifier to the results projection.
      objy::policy::Policies policies;
      policies.add("AddIdentifier.enable", true);

      objy::data::Variable results = doStatement.execute(policies);

      objy::data::LogicalType::type logicalType = results.specification()->logicalType();
      printf("results spec: %s\n", objy::data::LogicalType::toString(logicalType));

      if (logicalType == objy::data::LogicalType::Sequence) {
        objy::data::Sequence sequence = results.get<objy::data::Sequence>();
        objy::data::Variable sequenceItem;
        int count = 0;
        while (sequence.next()) {
          sequence.current(sequenceItem);
          stringstream os;
          sequenceItem.toJSON(os);
//          string queryResults = "Sequence Query results: " + os.str();
//          v8::Local<v8::Value> argv[argc] = { Nan::New(queryResults.c_str()).ToLocalChecked() };
          v8::Local<v8::Value> argv[argc] = { Nan::New(os.str().c_str()).ToLocalChecked() };
          Nan::MakeCallback(Nan::GetCurrentContext()->Global(), cb, argc, argv);
          count++;
          if (maxResults != -1 && count >= maxResults)
            break;
        }
      } 
      else {
        stringstream os;
        results.toJSON(os);
        string queryResults = "Query results: " + os.str();
        v8::Local<v8::Value> argv[argc] = { Nan::New(queryResults.c_str()).ToLocalChecked() };
        Nan::MakeCallback(Nan::GetCurrentContext()->Global(), cb, argc, argv);
      }

      tx->commit();
      tx->release();    
  } catch (ooKernelException& e) {
    printf("error: %s\n", e.what());
    return;
  } catch (ooBaseException& e) {
    printf("error: %s\n", e.what());
    return;
  }

}

//void ObjyAccess::Query2(const Nan::FunctionCallbackInfo<v8::Value>& info) {
//  v8::Local<v8::Function> cb = info[0].As<v8::Function>();
//  const unsigned argc = 1;
//  v8::Local<v8::Value> argv[argc] = { Nan::New("Query world (CB)").ToLocalChecked() };
//  Nan::MakeCallback(Nan::GetCurrentContext()->Global(), cb, argc, argv);
//}

void ObjyAccess::doQueryTest(const char* queryString)
{
  try {
      printf("Executing Query: '%s'\n", queryString);
      objy::db::Transaction* tx = new objy::db::Transaction(objy::db::OpenMode::Update, "write");
      //const objy::expression::language::Language* lang = objy::expression::language::LanguageRegistry::lookupLanguage("DO");
      //objy::expression::ExpressionTreeHandle eHandle = lang->parse(queryString);
      //eHandle->addRef();
      objy::statement::Statement doStatement(/*eHandle */ queryString);

      // Add the identifier to the results projection.
      objy::policy::Policies policies;
      policies.add("AddIdentifier.enable", true);

      objy::data::Variable results = doStatement.execute(policies);

      printf("results spec: %s\n", 
              objy::data::LogicalType::toString(results.specification()->logicalType()));

      stringstream os;
      results.toJSON(os);
      printf("results JSON :: %s\n", os.str().c_str());
      
//      if (results.specification()->logicalType() == objy::data::LogicalType::Sequence) {
//        // we got sequence of results.
//        objy::data::Sequence sequence = results.get<objy::data::Sequence>();
//      }

      tx->commit();
      tx->release();    
  } catch (ooKernelException& e) {
    printf("error: %s\n", e.what());
    return;
  } catch (ooBaseException& e) {
    printf("error: %s\n", e.what());
    return;
  }
}