# Сайт «ШинаТех»

## Запуск на компьютере
1. Распакуйте архив в любую папку (не запускайте файлы из архива напрямую).
2. Дважды щёлкните по `index.html` — сайт откроется в браузере.

## Как изменить цены
Откройте `index.html` в Блокноте (или VS Code) и найдите нужную цену.
Цены «Полный комплект» для легковых лежат в двух местах одной строки таблицы:
`data-full="1600"` (для калькулятора) и текст `1 600 ₽` (для показа). Меняйте оба.
Цена Газели за комплект: `data-gazel-set="4800"` и текст рядом.

## Публикация: GitHub + Vercel
1. Зарегистрируйтесь на github.com. Нажмите «+» → New repository, имя `shinatech`, Public, Create.
2. На странице репозитория нажмите «uploading an existing file», перетащите ВСЁ содержимое папки
   (index.html, style.css, script.js и папку img), нажмите Commit changes.
3. Зайдите на vercel.com → Sign Up → Continue with GitHub.
4. Add New → Project → выберите `shinatech` → Import.
5. Ничего не меняйте (Framework Preset: Other) → Deploy.
6. Через минуту получите ссылку вида shinatech.vercel.app. Свой домен: Project → Settings → Domains.
Обновление сайта: заменили файл на GitHub — Vercel опубликует новую версию сам.
