function setTooltipOnOff(container){
  const $container = $(container || '.tooltip-wrap');
  if ($container.length === 0 ) return;

  $container.each(function() {
    let that, isToggle;
    that = $(this);

    that.find('.btn-info').on('click', function() {
      if (that.find('.ico-info-tooltip').length > 0) {
        isToggle = true;
      }

      if (isToggle) {
        if (that.hasClass('active')) {
          that.removeClass('active').addClass('hide');
          that.find('.offscreen').text('툴팁 열기');
        } else {
          $('.tooltip-wrap.active').removeClass('active').addClass('hide');
          that.removeClass('hide').addClass('active');
          that.find('.offscreen').text('툴팁 닫기');

          // mo이면서 right 옵션 없을 시 화면 좌측 정렬
          if (windowWidth <= 890 && !that.hasClass('right')) {
            $(that).find('.tooltip-box').css('left', -that.offset().left + 20);
          }
        }
        return;
      }

      if (that.hasClass('active')) return;

      $('.tooltip-wrap.active').removeClass('active').addClass('hide');
      that.removeClass('hide').addClass('active');
    });

    if (!isToggle) {
      $(this).find('.btn-tooltip-close').on('click', function() {
        that.removeClass('active').addClass('hide');
      })
    }

    $(window).on('resize, scroll', function() {
      $('.tooltip-wrap').removeClass('active');
    });

    $(this).on(_transitionEnd, function() {
      $(this).removeClass('hide');
    })
  })
}

function setTooltipPosition(container) {
  const $container = $(container || '.tooltip-wrap');
  if ($container.length === 0) return;

  const tooltipBtnWrap = $('.tooltip-btn-wrap');
  const tooltipPopWrap = $('.tooltip-pop-wrap');
  const btnTooltipClose = $('.btn-tooltip-close');
  const btnTooltip = tooltipBtnWrap.find('.btn-info');

  // 툴팁 위치 계산
  function calculateTooltipPositon($btn, $box) {
    const windowWidth = $(window).outerWidth();
    const windowHeight = $(window).outerHeight();
    const scrollLeft = $(window).scrollLeft();
    const scrollTop = $(window).scrollTop();
    const tooltipWidth = $box.outerWidth();
    const tooltipHeight = $box.outerHeight();

    // 기본 위치 : 툴팁 버튼 아래
    let left = $btn.offset().left - scrollLeft;
    let top = 0;

    let isDialog = false;
    let dialogTop = 0;

    if (windowWidth > 890) { // PC
      top = $btn.offset().top - scrollTop + 15;  
    } else { // MO
      const dialogContent = $btn.closest('.ui-dialog-content');

      if(dialogContent.length > 0) { // 팝업 여부
        isDialog = true;
        dialogTop = dialogContent[0].getBoundingClientRect().top;
        top = $btn[0].getBoundingClientRect().top - tooltipHeight - 5;
      } else {
        top = $btn[0].getBoundingClientRect().top + 15;
      }
    }

    // 수직 보정
    if(top + tooltipHeight > windowHeight - 50) {
      top = top - tooltipHeight - 15; // 위쪽으로 이동
    } else if (top < 50) {
      top = $btn[0].getBoundingClientRect().top + 15; // 아래쪽으로 이동
    }

    // 수평 보정
    if (left + tooltipWidth > windowWidth) {
      left = windowWidth - tooltipWidth - 15; // 왼쪽으로 이동
    } else if (left < 0) {
      left = 10; // 오른쪽으로 이동
    }

    // 팝업 보정
    if(idDialog) {
      top -= dialogTop;
    }

    $box.css({
      'top': top,
      'left': left,
      'bottom': 'auto',
      'transform': 'none',
    });
  }

  function tooltipClickEvent() {
    $btnTooltip.off('click').on('click', function(event) {
      event.stopPropagation();

      const $btn = $(this);
      const $box = $(this).closest('.grid-list-wrap').find('tooltop-pop-wrap');
      const isActive = $btn.parent().hasClass('active');

      if(isActive) {
        $btn.parent().removeClass('active');
        $btn.fadeOut();
      } else {
        $tooltipBtnWrap.removeClass('active');
        $btn.parent().addClass('active');
        calculateTooltipPosition($btn, $box);
        $box.fadeIn();
      }
    });
  }

  tooltipClickEvent();

  function tooltipReset() {
    $tooltipBtnWrap.removeClass('active');
    $tooltipPopWrap.fadeOut(200);
  }

  $btnTooltipClose.on('click', function(event) {
    event.stopPropagation();
    tooltipReset();
  });

  $(window).on('resize', function() {
    tooltipReset();
    tooltipClickEvent();
  });

  $(window).on('scroll', function() {
    tooltipReset();
  });

  $container.on('pointerdown', function(event) {
    event.stopPropagation();
  });

  $(document).off('pointerdown').on('pointerdown', function() {
    if ($container.hasClass('active')) {
      tooltipReset();
    }
  });
}