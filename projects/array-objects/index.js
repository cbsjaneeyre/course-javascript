/* ДЗ 2 - работа с массивами и объектами */

/*
 Задание 1:

 Напишите аналог встроенного метода forEach для работы с массивами.
 Посмотрите как работает forEach и повторите это поведение для массива, который будет передан в параметре array

 Пример:
   forEach([1, 2, 3], (el) => console.log(el)); // выведет каждый элемент массива
 */
function forEach(array = [1, 2, 3], fn) {
  for (let i = 0; i < array.length; i++) {
    fn(array[i], i, array);
  }
}
/*
 Задание 2:

 Напишите аналог встроенного метода map для работы с массивами.
 Посмотрите как работает map и повторите это поведение для массива, который будет передан в параметре array

 Пример:
   const newArray = map([1, 2, 3], (el) => el ** 2);
   console.log(newArray); // выведет [1, 4, 9]
 */
function map(array = [4, 5, 6], fn) {
  const newArray = [];
  for (let i = 0; i < array.length; i++) {
    newArray.push(fn(array[i], i, array));
  }
  return newArray;
}
/*
 Задание 3:

 Напишите аналог встроенного метода reduce для работы с массивами.
 Посмотрите как работает reduce и повторите это поведение для массива, который будет передан в параметре array

 Пример:
   const sum = reduce([1, 2, 3], (all, current) => all + current);
   console.log(sum); // выведет 6
 */
function reduce(array = [3, 5, 8], fn, initialValue) {
  let accumulator = initialValue;
  let startValue = 0;

  if (initialValue === undefined) {
    startValue = 1;
    accumulator = array[0];
  }

  for (let i = startValue; i < array.length; i++) {
    accumulator = fn(accumulator, array[i], i, array);
  }

  return accumulator;
}
/*
 Задание 4:

 Функция должна перебрать все свойства объекта, преобразовать их имена в верхний регистр и вернуть в виде массива

 Пример:
   const keys = upperProps({ name: 'Сергей', lastName: 'Петров' });
   console.log(keys) // выведет ['NAME', 'LASTNAME']
 */
function upperProps(crows = { name: 'Kaz', lastName: 'Brekker' }) {
  return Object.keys(crows).map((key) => key.toUpperCase());
}

export { forEach, map, reduce, upperProps };
