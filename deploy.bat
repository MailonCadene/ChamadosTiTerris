@echo off
echo Fazendo build do projeto...
call npm run build

echo Copiando arquivos da pasta dist para raiz...
xcopy /E /Y dist\* .

echo Adicionando arquivos no git...
git add .

echo Fazendo commit das alterações...
git commit -m "Deploy: Copia arquivos da dist para raiz"

echo Enviando para o GitHub...
git push

echo Deployment concluído!