/* =================================================================
 * Pretty Table
 * https://github.com/bilxio/jquery-prettytable
 * =================================================================
 * version: 0.1.0
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
      var cols = table.find('tr td:nth-child(' + (colIdx + 1) + ')'),
          maxColumnWidth,
          metaColumnWidth,
          maxLengthText = '',
          paddingLeft,
          paddingRight,
          headerColumn;

      cols.each(function(idx, col) {
        var t = trim($(col).text());
        maxLengthText = 
          (t.length > trim(maxLengthText).length) ? t : maxLengthText;
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

      maxColumnWidth = isFunction(opts.maxColumnWidth) ? 
        opts.maxColumnWidth(headerColumn[0], maxColumnWidth) : maxColumnWidth;

      metaColumnWidth = isFunction(opts.metaColumnWidth) ?
        opts.metaColumnWidth(headerColumn[0]) : false;

      // 综合考虑指定列宽和动态计算值
      if (!!metaColumnWidth) {
        metaColumnWidth += fixedPadding;
        maxColumnWidth = Math.min(maxColumnWidth, metaColumnWidth);
        if (hasScroller) {
          headerColumn.css('width', maxColumnWidth + 'px');
        } else {
          headerColumn.css('max-width', maxColumnWidth + 'px');
        }
        tableWidth += maxColumnWidth;
      }
      // 只应用动态计算值
      else {
        opts.setColumnWidth(headerColumn[0], maxColumnWidth);
        tableWidth += maxColumnWidth;
      }
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
        $(this).data('prettyTable', new PrettyTable(this, options));
      });
    }
  }

  var old = $.fn.prettyTable;

  $.fn.prettyTable = Plugin;
  $.fn.prettyTable.Constructor = PrettyTable;


  // PRETTYTABLE NO CONFLICT
  // =======================

  $.fn.prettyTable.noConflict = function () {
    $.fn.prettyTable = old;
    return this;
  };

})(jQuery);