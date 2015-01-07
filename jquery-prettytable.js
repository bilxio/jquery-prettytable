/* =================================================================
 * Pretty Table
 * https://github.com/bilxio/jquery-prettytable
 * =================================================================
 * version: 0.1.1
 * author: Xiong Zhengdong<xiongzhengdong@admaster.com.cn>
 * Licensed under MIT
 * ================================================================= */

;(function($){
  'use strict';

  var
  slice = Array.prototype.slice,
  toString = Object.prototype.toString,
  
  isObject = function(obj) {
    return !!obj && typeof(obj) === 'object' &&
      toString.call(obj) === '[object Object]';
  },

  isFunction = function(obj) {
    return !!obj && toString.call(obj) === '[object Function]';
  },

  /**
   * 文字在浏览器中渲染之后的实际宽度，单位是像素。
   * @param text {string} 要获得宽度的字符串
   * @param font {string} 指定应用的字体，默认为 `12px arial`
   */
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

  /**
   * 获取字符串实际长度。中文字符长度为2，英文字符为1
   * @param str {string} 要获得长度的字符串
   */
  textLength = function(str) {
      var realLength = 0, len = str.length, charCode = -1;
      for (var i = 0; i < len; i++) {
          charCode = str.charCodeAt(i);
          if (charCode >= 0 && charCode <= 128) realLength += 1;
          else realLength += 2;
      }
      return realLength;
  },

  trim = String.prototype.trim ? function(text) {
    return !text ? '' : text.trim();
  } : function(text) {
    return !text ? '' : text.replace(/(^\s+)|(\s+$)/g, '');
  };

  // PRETTYTABLE PUBLIC CLASS DEFINITION
  // ===================================

  var PrettyTable = function(table, options) {
    var el = this.el = table,
        $el = this.$el = $(table),
        hasScroller = $el.data('scroller') || false;

    this.options = $.extend({

      /**
       * 滚动条。默认不显示滚动条。
       * 取值 'x' 表示支持水平滚动条。
       */
      scroller: hasScroller,

      /**
       * 固定预留宽度
       */
      fixedPadding: 20,

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
        var width = maxColumnWidth;
        var $hc = $(headerColumn);
        var iconWidth = this.iconWidth;

        if ($hc.find('.iconfont')[0]) {
          width += iconWidth;
        }
        if ($hc.find('.filter:visible')[0]) {
          width += iconWidth;
        }
        if ($hc.find('.sorter:visible')[0]) {
          width += iconWidth;
        }
        return width;
      },

      /**
       * 最大列宽限制
       */
      metaColumnWidth : function (headerColumn) {
        var w = $(headerColumn).data('width');
        return $.isNumeric(w) ? parseInt(w) : false;
      },

      /**
       * @param headerColumn {DOM object}
       * @param width {int} Width for this column.
       * @param metaColumnWidth {int|string|false} Predefined width for this column. use 
       *    extra attr `data-width` to define.
       */
      setColumnWidth : function (headerColumn, width, metaColumnWidth) {
        var maxColumnWidth = width;
        var metaWidth = metaColumnWidth;
        var hasScroller = !!this.scroller;
        var $hc = $(headerColumn);
        var isFlex = $hc.data('width') === 'flex';
        var fixedWidth = $.isNumeric($hc.data('fixed-width')) ? 
            parseInt($hc.data('fixed-width')) : false;

        // `flex` means don't set width any more.
        if (isFlex) {
          return;
        }

        // 综合考虑指定列宽和动态计算值
        if ($.isNumeric(metaWidth)) {
          metaWidth += this.fixedPadding;
          maxColumnWidth = Math.min(maxColumnWidth, metaWidth);
        }

        // 强制指定列宽
        if (fixedWidth) {
          maxColumnWidth = fixedWidth;
        }

        //if (hasScroller || !!metaColumnWidth) {
          $hc.css('width', maxColumnWidth + 'px');
        //} else {
        //  $hc.css('maxWidth', maxColumnWidth + 'px');
        //}
      }
    }, options);
    this.init();
  };

  PrettyTable.prototype.init = function() {
    this._adjustColumnWidth();
  };

  /**
   * Refresh will re-calculate size of all columns in the table.
   */
  PrettyTable.prototype.refresh = function() {
    this._adjustColumnWidth();
  };

  /** 
   * Method `lock` means ignore any wheel events from mouse or 
   * track pad(Mac), the scroller will keep the position until
   * the `unlock` method be invoked.
   */
  PrettyTable.prototype.lock = function() {
    if (!this.options.scroller) {
      return;
    }
    this.$el.closest('.prettytable-scroll-container').
      off('mousewheel.pt').
      on('mousewheel.pt', function(){
        return false;
      }).end().trigger('lock.pt');
  };

  PrettyTable.prototype.unlock = function() {
    if (!this.options.scroller) {
      return;
    }
    this.$el.closest('.prettytable-scroll-container').
      off('mousewheel.pt').
      end().trigger('unlock.pt');
  };

  PrettyTable.prototype._adjustColumnWidth = function() {
    var opts = this.options,
        fixedPadding = opts.fixedPadding,
        iconWidth = opts.iconWidth,
        hasScroller = !!opts.scroller;

    var table = this.$el,
        tableHeaderRow = table.find('thead > tr:first'),
        tableParent = table.parent(),
        tableOriginWidth = tableParent.outerWidth(),
        tableParentOverflow = table.parent().css('overflow'),
        font = table.css('font'),
        colSize = table.find('thead > tr:first > th').size(),
        tableWidth = 0;

    // force set overflow to hidden to prevent table flashing
    if (opts.scroller && tableParentOverflow != 'hidden') {
      tableParent.css('overflow', 'hidden');
    }

    var adjCol = function(colIdx) {
      var cols = table.find('tbody:visible tr td:nth-child(' + (colIdx + 1) + ')'),
          maxColumnWidth,
          metaColumnWidth,
          maxLengthText = '',
          paddingLeft,
          paddingRight,
          headerColumn;

      cols.each(function(idx, col) {
        var t = trim($(col).text()) || '';
        maxLengthText = (textLength(t) > textLength(trim(maxLengthText))) ?
          t : maxLengthText;
      });

      headerColumn = tableHeaderRow.find('th').eq(colIdx);
    
      // find out the longest text among body rows and header row
      if (textLength(trim(headerColumn.text())) > textLength(maxLengthText))
        maxLengthText = trim(headerColumn.text());

      // calculate the real width for the longest text as column width in pixel
      maxColumnWidth = textWidth(maxLengthText, font) + fixedPadding;

      maxColumnWidth = isFunction(opts.maxColumnWidth) ? 
        opts.maxColumnWidth(headerColumn[0], maxColumnWidth) : maxColumnWidth;

      metaColumnWidth = isFunction(opts.metaColumnWidth) ?
          opts.metaColumnWidth(headerColumn[0]) : false;

      // apply width to column
      opts.setColumnWidth(headerColumn[0], maxColumnWidth, metaColumnWidth);
    };

    for (var colIdx = 0; colIdx < colSize; colIdx++) {
      adjCol(colIdx);
    }

    if (!opts.scroller) {
      return;
    }

    // .prettytable-scroll-container
    _.delay(function() {
      var tableWidth;
      tableWidth = table.outerWidth();
      if (tableWidth > tableOriginWidth) {
        table.css('width', tableWidth + 'px');
        table.toggleClass('table-scrollable', true);
        if (table.parent().is(':not(.prettytable-scroll-container)')) {
          table.wrap('<div class="prettytable-scroll-container"></div>');
        }
      }
      // double check
      _.delay(function() {
        var tableContainerWidth;
        tableWidth = table.outerWidth();
        tableContainerWidth = table.parent().width();
        if (tableWidth < tableContainerWidth) {
          table.css('width', '100%');
        }
      }, 20);

      // restore `overflow` for table parent
      tableParent.css('overflow', tableParentOverflow);
    }, 20);
  };


  // PRETTYTABLE PLUGIN DEFINITION
  // =============================

  function Plugin(options) {
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
      // can't access private method
      if (/^\-.*/.test(options)) {
        return;
      }
      try {
        return instance[options].apply(instance, slice.call(arguments, 1));
      } catch (e) {}
    } 
    // create new instance
    else {
      options = isObject(options) ? options : {};
      return this.each(function(){
        if ($(this).data('prettyTable'))
          return;
        $(this).toggleClass('prettytable', true);
        $(this).data('prettyTable', new PrettyTable(this, options));
      });
    }
  }

  var old = $.fn.prettyTable;

  $.fn.prettyTable = Plugin;
  $.fn.prettyTable.Constructor = PrettyTable;

  $.PrettyTable = {
    textWidth: textWidth,
    textLength: textLength
  };

  // PRETTYTABLE NO CONFLICT
  // =======================

  $.fn.prettyTable.noConflict = function () {
    $.fn.prettyTable = old;
    return this;
  };

})(jQuery);