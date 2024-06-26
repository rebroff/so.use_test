# so.use_test

Не совсем было ясно - картинка больше контейнера как задел для будущего скейла по наведению (без потери качества) или она должна быть таковой изначально. Поэтому в папке custom скейлится изображение 350х350, а в папке bootstrap - до 350х350.  

Так же не совсем ясно, какая система координат подразумевалась при указании брейкпойнтов: mobile или desktop first. Потому что по логике последовательности перечисления "до 1100" - это 1101 - 1599, но тогда выпадает диапазон меньше 420.  
В итоге сделал первое, так как она используется в бутстрапе по умолчанию.

В папке bootstrap - сборка на галпе, так как для переопределения переменных бустрапа нужен scss и соответственно его компилятор.  

Init:
```sh
npm i
```

Development:
```sh
npm run dev
```

Production:
```sh
npm run build
```
