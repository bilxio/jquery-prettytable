jquery-prettytable
==================

>Make your table looks pretty.

[![Build Status](https://travis-ci.org/bilxio/jquery-prettytable.png)](https://travis-ci.org/bilxio/jquery-prettytable)

## Requirements

- jQuery 2.1.0+
- Bootstrap 3

## Usage

Enable prettytable via javascript:
```javascript
$('.table[data-role=prettytable]').prettyTable();
```

Set max column width:
```html
<table data-role="prettytable">
  <thead>
    <tr>
      <th data-width="100">
        ...
```
> Will apply the min value of `data-width` and dynamic calculated finally.

Set column width according on `data-min-width` and auto calculated value:
```html
<table data-role="prettytable">
  <thead>
    <tr>
      <th data-min-width="100">
        ...
```

Set fixed column width:
```html
<table data-role="prettytable">
  <thead>
    <tr>
      <th data-fixed-width="100">
        ...
```

Set flex column width:
```html
<table data-role="prettytable">
  <thead>
    <tr>
      <th data-width="flex">
        ...
```

### Options
Options can be passed via data attributes or JavaScript.

> Scroller now only accept `false` or `'x'`

|Name |Type|Default|Desciption|
|-----|----|-------|----------|
|scroller|string or false|false|enable horizontal scroller or not|
|fixedPadding|int|20|Reserved width for header column|
|iconWidth|int|20|Extra icon width such as question mark|
|maxColumnWidth|function|-|-|

scroller option example:

```javascript
// programming style
$('.table[data-role=prettytable]').prettyTable({
  scroller: 'x'
});
```

or

```html
<!-- conventional style -->
<table data-role="prettytable" data-scroller="x">
  ...
</table>
```
```javascript
$('.table[data-role=prettytable]').prettyTable();
```


## Methods

- `lock()` freeze mouse wheel, ignore its events
- `unlock()` release mouse wheel, restore events
- `refresh()` re-adjust columns of table

how to invoke?
> only get invoked on the first matched jQuery objects.

```javascript
var result = $('.table[data-role=prettytable]').prettyTable(METHOD_NAME);
```

## Events

- `lock.pt` triggered when `lock()` method be invoked
- `unlock.pt` triggered when `unlock()` method be invoked

subscribe event(s):

```javascript
$(document.body).on('lock.pt', '.prettytable', function() {
  // do something...
})
```

### History

- __v0.1.0__  Dec 31, 2014
  first release with only kernal features.
- __v0.1.1__  Jan 07, 2014
- __v0.1.2__
  +Remove underscore.js as a dependency.
  +Add travis-CI support.

## FAQ

### Q1: How to support max width of column?

Add an additional attribute to the `<th>` tag,
```html
<table class="prettytable" data-role="prettytable">
  <thead>
    <tr>
      <th data-width=200>
        ...
```

## More info

- by [Xiong Zhengdong](http://www.billworks.cc)
- since Dec 31, 2014