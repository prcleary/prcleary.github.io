---
title: Gentle introduction to Python
date: 2022-11-08
tags:
  - Python
---

You can run Python in your browser [here](https://www.online-python.com/).

BBC Bitesize revision notes are [here](https://www.bbc.co.uk/bitesize/guides/zfnny4j/revision/1).

### Variables

- temporary stores for data
- useful because data changes and you don't want to rewrite your code
- different types: strings, integers, floating point numbers etc
- easy to create in Python

```python
greeting = 'Hello world!'
print(greeting)
```

Variable names

- should be meaningful/descriptive, to make your code easier to read
- usually lower-case (not using capitals)
- should not contain special characters e.g. `#`, `?` as these often have other meanings, or start with a number
- stick to lower case and underscores and you will be fine, e.g. `full_name`

Declaration of variables

- some programming languages make you say ("declare") which variables you are using and what type they have before you can use them; this can help prevent bugs in code
- Python allows you to "declare" variables the first time you use them
- giving a variable a value is called "assignment"

Variables can change when a program runs. Constants are created the same way but

- don't change when the program runs
- are usually given names with capital letters (upper case) to make clear that they are not variables

```python
PI = 3.1415926535
print(PI)
```

We can hide variables so that other parts of the code can't see them or change them. This is helpful when you are working on code with other people who may accidentally use the same variable names as you. One way of doing this is to create a function and keep your important variables in there.

```python
y = 100
def multiply_by(input):
  y = 2
  return input * y
print(multiply_by(10))
```

Make sure you understand why the code above gives the answer 20.

We create functions using the `def` keyword.

You name functions just like variables - here `multiply_by`.

A function takes some input (here a variable called `input`) and "returns" the result of the calculations in the function.

Note that if there is a `y` variable in the function code, the `y` variable outside the function code is ignored.

We call it a "local variable" when that variable is only available within some of the code.

We call it a "global variable" when that variable is available in any part of the code. Global variables can be a problem (other coders may use the same variable names) so use local variables when you can.



