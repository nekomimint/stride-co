const js = require('@eslint/js');

module.exports = [
    // Reglas par la verificacion del codigo
    // Reglas base de eslint o emacslint (Javascript)
    js.configs.recommended,
    {
        languageOptions : {
            ecmaVersion: 2022,
            sourceType: 'commonjs',
            globals : { 
                // Variables en tiempo real de ejecucion
                require: 'readonly',
                module: "writable",
                exports: "writable",
                __dirname:'readonly',
            }
        },
        rules: { 
            // Que reglas quiero aplicar
            // Que es una regla? No quiero que usen var para declarar variables
            'no-unused-vars': 'warn',
            // Make the comments after code show an error like:
            // int x = 10; // Comment | This will show an error
            'no-inline-comments': 'error',
             // Avoid to make abstract comparisons ( == ) throwing an error
            'eqeqeq': 'error',
            // Custom rules for this project
            //"no-console": "off", // This will be use in production to avoid console show debug
            'no-use-before-define':['error', {functions: false, classes: true, variables: true}],

        },
        
        
    },
    {
// Config adicional
    // Solo aplica a los archivos de test -> Pruebas
    files: ['tests/**/*.js'], languageOptions: {
        globals:{
            require: 'readonly',
            module: 'writable',
            exports: 'writable',
            describe: 'readonly',
            test:'readonly',
            expect:'readonly',
            beforeEach:'readonly',
            jest:'readonly'
        }
    },

        // pendiente hasta que implementos las pruebas
    },
    // Exlusiones globales
    // Son carpetas/archivos que eslint no debe verificar/analizar
    {
        ignores: [
            'node_modules/',
            'logs/'
        ]
    }
];