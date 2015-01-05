// Pretty Table
// author: Xiong Zhengdong<xiongzhengdong@admaster.com.cn>
;(function($){
  'use strict';

  var
  slice = Array.prototype.slice,
  toString = Object.prototype.toString,
  
  isFunction = function(obj) {
    return !!obj && toString.call(obj) === '[object Function]';
  },

  textWidth = function(text, font) {
    var f = font || '12px arial',
        o = $('<div>' + text + '</div>')
          .css({'position': 'absolute', 
            'float': 'left', 
            'white-space': 'nowrap', 
            'visibility': 'hidden', 
            'font': f})
          .appendTo($('body')),
        w = o.width();
    o.remove();
    return w;
  },

  trim = String.prototype.trim ? function(text) {
    return !text ? '' : text.trim();
  } : function(text) {
    return !text ? '' : text.replace(/(^\s+)|(\s+$)/g, '');
  };

  var PrettyTable = function(table, options) {
    this.el = table;
    this.$el = $(table);
    this.options = $.extend({
      /**
       * 滚动条。默认不显示滚动条。
       * 取值 'x' 表示支持水平滚动条。
       */
      scroller: false,
      /**
       * 固定预留宽度
       */
      fixedPadding: 40,
      /**
       * 考虑图标宽度
       */
      iconWidth: 20,
      /**
       * 计算最大列宽，默认直接返回计算好的最大列宽
       * @param headerColumn {DOM object}
       * @param maxColumnWidth {int}
       */
      maxColumnWidth : function (headerColumn, maxColumnWidth) {
        var metaColumnWidth = this.metaColumnWidth(headerColumn);
        if (metaColumnWidth) {
          return metaColumnWidth;
        }
        return maxColumnWidth;
      },
      /**
       * 最大列宽限制
       */
      metaColumnWidth : function (headerColumn) {
        return parseInt($(headerColumn).data('width'));
      },

      /**
       * @param headerColumn {DOM object}
       * @param width {int}
       */
      setColumnWidth : function (headerColumn, width) {
        $(headerColumn).css('width', width + 'px');  
      }
    }, options);
    this.adjustColumnWidth();
  };

  PrettyTable.prototype.refresh = function() {
    this.adjustColumnWidth();
  };
  PrettyTable.prototype.lock = function() {
    if (!this.options.scroller) {
      return;
    }
  };
  PrettyTable.prototype.unlock = function() {
    if (!this.options.scroller) {
      return;
    }
  };
  PrettyTable.prototype.adjustColumnWidth = function() {
    var opts = this.options,
        fixedPadding = opts.fixedPadding,
        iconWidth = opts.iconWidth;

    var table = this.$el,
        tableHeaderRow = table.find('thead > tr:first'),
        tableParent = table.parent(),
        tableOriginWidth = tableParent.outerWidth(),
        tableParentOverflow = table.parent().css('overflow'),
        font = table.css('font'),
        colSize = table.find('thead > tr:first > th').size(),
        tableWidth = 0;

    // force set overflow to hidden to prevent table flashing
    if (tableParentOverflow != 'hidden') {
      tableParent.css('overflow', 'hidden');
    }

    var adjCol = function(colIdx) {
      var cols = table.find('tr td:nth-child(' + (colIdx + 1) + ')'),
          maxColumnWidth,
          metaColumnWidth,
          maxLengthText,
          paddingLeft,
          paddingRight,
          headerColumn;

      cols.each(function(idx, col) {
        var t = trim($(col).text());
        maxLengthText = 
          t.length > trim(maxLengthText).length ? t : maxLengthText;
      });

      headerColumn = tableHeaderRow.find('th').eq(colIdx);
    
      // find out the longest text among body rows and header row
      if (trim(headerColumn.text()).length > maxLengthText.length)
        maxLengthText = trim(headerColumn.text());

      // calculate the real width for the longest text as column width in pixel
      maxColumnWidth = textWidth(maxLengthText, font) + fixedPadding;
      
      if (headerColumn.find('.iconfont')[0]) {
        maxColumnWidth += iconWidth;
      }
      if (headerColumn.find('.filter:visible')[0]) {
        headerColumn.find('.table-cell').css('paddingLeft', iconWidth);
      }
      if (headerColumn.find('.sorter:visible')[0]) {
        headerColumn.find('.table-cell').css('paddingRight', iconWidth);
      }

      maxColumnWidth = isFunction(opts.maxColumnWidth)
        ? opts.maxColumnWidth(headerColumn[0], maxColumnWidth) 
        : maxColumnWidth;

      metaColumnWidth = isFunction(opts.metaColumnWidth)
        ? opts.metaColumnWidth(headerColumn[0]) : false;

      // 综合考虑指定列宽和动态计算值
      if (!!metaColumnWidth) {
        metaColumnWidth += fixedPadding;
        maxColumnWidth = Math.min(maxColumnWidth, metaColumnWidth);
        headerColumn.css('max-width', maxColumnWidth + 'px');
        tableWidth += maxColumnWidth
      }
      // 只应用动态计算值
      else {
        opts.setColumnWidth(headerColumn[0], maxColumnWidth);
        tableWidth += maxColumnWidth
      }
    };

    for (var colIdx = 0; colIdx < colSize; colIdx++) {
      adjCol(colIdx);
    }
  };

  $.fn.extend({
    prettyTable: function(options) {
      // method invoke
      if (typeof options == 'string') {
        var self = this[0];
        var instance = $(self).data('prettyTable');
        if (!instance) {
          return "Not initialized.";
        }
        if (options === 'instance') {
          return instance;
        }

        try {
          return instance[options].apply(instance, slice.call(arguments, 1));
        } catch (e) {}
      } 
      // create new instance
      else {
        return this.each(function(){
          if ($(this).data('prettyTable'))
            return;
          $(this).data('prettyTable', new PrettyTable(this, {}));
          console.info('create table')
        });
      }
    } 
  });

})(jQuery);