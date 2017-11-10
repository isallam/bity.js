{
  "targets": [
    {
      'target_name': "objyaccess",
      'variables': {
        'objyver%': '12.5'
      },
      'defines': [
      	'DEFINE_FOO',
        '_GLIBCXX_USE_CXX11_ABI=0'
      ],
      'include_dirs' : [
        "<!(nodejs -e \"require('nan')\")",
        "/opt/Objectivity/<(objyver)/include"
      ],
      'sources': [
        'src/addon.cpp', 'src/objyAccess.cpp'
      ],
      'cflags!': [ '-fno-exceptions' ],
      'cflags_cc!': [ '-fno-exceptions' ],
      'link_settings': {
        'library_dirs': [
          '/opt/Objectivity/<(objyver)/lib',
        ],
        'libraries': [
          '-loo.<(objyver)', '-looSessionManager.<(objyver)', '-looObjectModel.<(objyver)', 
          '-looData.<(objyver)', '-looPolicy.<(objyver)', '-looStatement.<(objyver)'
        ],
      },
    }
  ]
}
