#!/bin/bash

npx concurrently -n 'make:scripts,make:lib    ,make:tests  ' 'npm run _make:scripts' 'npm run _make:lib' 'npm run _make:tests'