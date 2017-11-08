#include "objyAccess.h"


Nan::Persistent<v8::Function> ObjyAccess::constructor;

void string_to_oid(const char* str, /* out: */ ooId& oid) {
  int db, oc, page, slot;
  db = -1;
  slot = -1;
  if (str[0] == '#')
    str++;
  sscanf(str, "%d-%d-%d-%d", &db, &oc, &page, &slot);
  if (db <= 0 || db > 0xFFFF || slot < 0 || slot > 0xFFFF)
    throw ooFormattedException("Invalid OID string: \"%s\"", str);
  oid._DB = db;
  oid._OC = oc;
  oid._page = page;
  oid._slot = slot;
}

// replace douple quotes with single to allow for JSON string representation
void replace_douple_quotes(char* str)
{
  for (int i = 0; i < strlen(str); i++)
  {
    if (str[i] == '\"')
      str[i] = '\'';
  }
}


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
  Nan::SetPrototypeMethod(tpl, "update", Update);
  Nan::SetPrototypeMethod(tpl, "getObject", GetObject);
  Nan::SetPrototypeMethod(tpl, "getEdges", GetEdges);

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
    //printf("Got query string: %s\n", (const char*)(*queryString));
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
      //printf("Executing Query: \'%s\'\n", qString.c_str());
      objy::db::Transaction* tx = new objy::db::Transaction(objy::db::OpenMode::ReadOnly, "read");
      try {
        objy::statement::Statement doStatement(/*eHandle */ qString.c_str());

        // Add the identifier to the results projection.
        objy::policy::Policies policies;
        policies.add("AddIdentifier.enable", true);

        objy::data::Variable results = doStatement.execute(policies);

        objy::data::LogicalType::type logicalType = results.specification()->logicalType();
        //printf("results spec: %s\n", objy::data::LogicalType::toString(logicalType));

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
            {
              //printf("... we reached max results.\n");
              break;
            }
          }
          if (count == 0) // nothing available, we'll return an empty JSON
          {
            //printf("results: %d\n", count);
            v8::Local<v8::Value> argv[argc] = { Nan::New("{}").ToLocalChecked() };
            Nan::MakeCallback(Nan::GetCurrentContext()->Global(), cb, argc, argv);
          }
        } 
        else {
          stringstream os;
          results.toJSON(os);
          //string queryResults = "Query results: " + os.str();
          v8::Local<v8::Value> argv[argc] = { Nan::New(os.str().c_str()).ToLocalChecked() };
          Nan::MakeCallback(Nan::GetCurrentContext()->Global(), cb, argc, argv);
        }
      } catch (objy::UserException& e) {
        ObjyAccess::reportError(cb, e.what());
        printf("error1.1: %s\n", e.what());
      } 
      
      //printf("committing transaction.\n");
      tx->commit();
      tx->release();    
  } catch (ooKernelException& e) {
    ObjyAccess::reportError(cb, e.what());
    printf("error2.1: %s\n", e.what());
  } catch (ooBaseException& e) {
    ObjyAccess::reportError(cb, e.what());
    printf("error2.2: %s\n", e.what());
  }

}

void ObjyAccess::Update(const Nan::FunctionCallbackInfo<v8::Value>& info) {

  v8::Isolate* isolate = info.GetIsolate();
  ObjyAccess* obj = ObjectWrap::Unwrap<ObjyAccess>(info.Holder());
  string doString;
  v8::Local<v8::Function> cb;
  
  if (info[0]->IsString())
  {
    v8::String::Utf8Value queryString(info[0]->ToString());
    //printf("Got query string: %s\n", (const char*)(*queryString));
    doString = (const char*)(*queryString);
    //obj->doQuery((const char*)(*queryString));
  }
  else {
    isolate->ThrowException(v8::Exception::TypeError(
      v8::String::NewFromUtf8(isolate, "Missing valid query string.")));
    return;
  }
  cb = info[1].As<v8::Function>();
  const int argc = 1;
  
  try {
      //printf("Executing Query: '%s'\n", qString);
      objy::db::Transaction* tx = new objy::db::Transaction(objy::db::OpenMode::Update, "write");
      objy::statement::Statement doStatement(doString.c_str());

      objy::data::Variable results = doStatement.execute();

      stringstream os;
      results.toJSON(os);
      //string queryResults = "Query results: " + os.str();
      v8::Local<v8::Value> argv[argc] = { Nan::New(os.str().c_str()).ToLocalChecked() };
      Nan::MakeCallback(Nan::GetCurrentContext()->Global(), cb, argc, argv);

      tx->commit();
      tx->release();    
  } catch (ooKernelException& e) {
    ObjyAccess::reportError(cb, e.what());
    printf("error1: %s\n", e.what());
  } catch (ooBaseException& e) {
    ObjyAccess::reportError(cb, e.what());
    printf("error2: %s\n", e.what());
  }

}

void ObjyAccess::GetObject(const Nan::FunctionCallbackInfo<v8::Value>& info) {

  v8::Isolate* isolate = info.GetIsolate();
  ObjyAccess* obj = ObjectWrap::Unwrap<ObjyAccess>(info.Holder());
  ooId oid;
  v8::Local<v8::Function> cb;
  
  if (info[0]->IsString())
  {
    v8::String::Utf8Value oidString(info[0]->ToString());
    //printf("Got OID: %s\n", (const char*)(*oidString));
    string_to_oid((const char*)(*oidString), oid);
  }
  else {
    isolate->ThrowException(v8::Exception::TypeError(
      v8::String::NewFromUtf8(isolate, "Missing valid OID string.")));
    return;
  }

  cb = info[1].As<v8::Function>();

  const int argc = 1;
  
  try {
      //printf("Executing Query: '%s'\n", qString);
      objy::db::Transaction* tx = new objy::db::Transaction(objy::db::OpenMode::ReadOnly, "read");
      //objy::data::Reference objRef = objy::data::referenceFor(oid);
      objy::data::Object obj = objy::data::objectFor(oid);
      objy::data::Variable var(obj);
      stringstream os;
      var.toJSON(os);
      v8::Local<v8::Value> argv[argc] = { Nan::New(os.str().c_str()).ToLocalChecked() };
      Nan::MakeCallback(Nan::GetCurrentContext()->Global(), cb, argc, argv);

      tx->commit();
      tx->release();    
  } catch (ooKernelException& e) {
    ObjyAccess::reportError(cb, e.what());
    printf("error1: %s\n", e.what());
  } catch (ooBaseException& e) {
    ObjyAccess::reportError(cb, e.what());
    printf("error2: %s\n", e.what());
  }

}

void ObjyAccess::GetEdges(const Nan::FunctionCallbackInfo<v8::Value>& info) {

  v8::Isolate* isolate = info.GetIsolate();
  ObjyAccess* obj = ObjectWrap::Unwrap<ObjyAccess>(info.Holder());
  ooId oid;
  int maxResults = -1;
  v8::Local<v8::Function> cb;
  
  if (info[0]->IsString())
  {
    v8::String::Utf8Value oidString(info[0]->ToString());
    //printf("Got OID: %s\n", (const char*)(*oidString));
    string_to_oid((const char*)(*oidString), oid);
  }
  else {
    isolate->ThrowException(v8::Exception::TypeError(
      v8::String::NewFromUtf8(isolate, "Missing valid OID string.")));
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
      try {
        objy::data::Object obj = objy::data::objectFor(oid);
        objy::data::Class targetClass = objy::data::lookupClass("ooObj");
        objy::data::Sequence sequence = obj.edges(NULL, NULL, targetClass, false);
          objy::data::Variable sequenceItem;
          int count = 0;
          while (sequence.next()) {
            sequence.current(sequenceItem);
            stringstream os;
            sequenceItem.toJSON(os);
            v8::Local<v8::Value> argv[argc] = { Nan::New(os.str().c_str()).ToLocalChecked() };
            Nan::MakeCallback(Nan::GetCurrentContext()->Global(), cb, argc, argv);
            count++;
            if (maxResults != -1 && count >= maxResults)
              break;
          }
          if (count == 0) // nothing available, we'll return an empty JSON
          {
            //printf("results: %d\n", count);
            v8::Local<v8::Value> argv[argc] = { Nan::New("{}").ToLocalChecked() };
            Nan::MakeCallback(Nan::GetCurrentContext()->Global(), cb, argc, argv);
          }
      } catch (objy::UserException& e) {
        ObjyAccess::reportError(cb, e.what());
        printf("error3.1: %s\n", e.what());
      } 

      tx->commit();
      tx->release();    
  } catch (ooKernelException& e) {
    ObjyAccess::reportError(cb, e.what());
    printf("error4.1: %s\n", e.what());
  } catch (ooBaseException& e) {
    ObjyAccess::reportError(cb, e.what());
    printf("error4.2: %s\n", e.what());
  }

}

void ObjyAccess::reportError(v8::Local<v8::Function> cb, const char* errorMessage) 
{
  const int buffSize = 1024;
  char errorStr[1024];
  strncpy(errorStr, errorMessage, buffSize-1);
  errorStr[buffSize-1] = '\0';
  
  //printf("reportError: %s\n", errorStr);
  const int argc = 1;
  
  char buffer[buffSize];
  replace_douple_quotes(errorStr);
  sprintf(buffer, "{\"status\":\"ERROR: %s\"}", errorStr);
  v8::Local<v8::Value> argv[argc] = { Nan::New(buffer).ToLocalChecked() };
  Nan::MakeCallback(Nan::GetCurrentContext()->Global(), cb, argc, argv);
}

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
  } catch (ooBaseException& e) {
    printf("error: %s\n", e.what());
  }
}