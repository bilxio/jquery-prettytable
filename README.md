jquery-prettytable
==================

>Make your table looks pretty.

## Requirements

- jQuery 2.1.0+
- Bootstrap 3
- Underscore 1.7.0+

## Usage

Enable prettytable via javascript:
```javascript
$('.table[data-role=prettytable]').prettyTable();
```

### Options
Options can be passed via data attributes or JavaScript.

> Scroller now only accept `false` or `'x'`

|Name |Type|Default|Desciption|
|-----|----|-------|----------|
|scroller|string or false|false|enable horizontal scroller or not|
|fixedPadding|int|40|Reserved width for header column|
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

- v0.1.0, Dec 31, 2014, first release with only kernal features.

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

- created by [Xiong Zhengdong](http://www.billworks.cc)
- since Dec 31, 2014