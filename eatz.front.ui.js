/*
 * name : eatz.front.ui.js
 * desc : UI 공통 자바스크립트
 * writer : glim
 * date : 2022/07/00
 * last : 2022/12/09
*/




var $_btnGoTop,
    $_headerWrapper,
    $_container,
    $_wrapper,
    _dialogCount = 0,
    _scrollTop = 0,
    _isIos,
    _isMac,
    _isAndroid,
    _transitionEnd = 'transitionend webkitTransitionEnd oTransitionEnd otransitionend',
    _fisHeight = 0,
    _vh,
    _resizeVh,
    _resizeVw,
    _sizeViewSta,
    _noScroll = false,
    _desktopWidth = 890;
let _acMsg;
let _contentTypeLi;

const contentType = {COUPON: "cpn"};
var eatzPub = eatzPub || {};


$(function () {
    $.widget("ui.selectmenu", $.ui.selectmenu, {
        calcMenuWidth: function () {
            var instance;
            instance = this;
            btnWidth = instance.button.outerWidth();
            menuWidth = instance.menuWrap.outerWidth();
            instance.menuWrap.css('width', btnWidth+10);
        }
    });
});

eatzPub.front = eatzPub.front || (function () {
    var _front;
    _front = {};

    /*
        * date : 20230111
        * last : 20230111
        * name : createScrollStopListener(element, callback)
        * pram :
        *		@param element  - 스크롤 영역 요소
        *		@param callback - 마이페이지 스크롤이 끝나고 callback 함수
        * desc : 스크롤이 끝난 후 callback 함수 실행
    */
    function createScrollStopListener(element, callback) {
        var handle = null;
        var onScroll = function () {
            var mobileType = navigator.userAgent.toLowerCase();
            var delay = (mobileType.indexOf('iphone') > -1 || mobileType.indexOf('ipad') > -1 || mobileType.indexOf('ipod') > -1) ? 65 : 15;

            if (handle) clearTimeout(handle);
            handle = setTimeout(callback, delay);
        };

        clearTimeout($(document).data('scrollEnd'));

        $(window).on('scroll', function (event) {
            _scrollTop = $(window).scrollTop();
            if ($(document).data('scrollEnd')) clearTimeout($(document).data('scrollStopListener'));
            $(document).data('scrollEnd', setTimeout(onScroll, event));
        });

        return function () {
            clearTimeout($(document).data('scrollEnd'));
            $(window).on('scroll', function (event) {
                _scrollTop = $(window).scrollTop();
                if ($(document).data('scrollEnd')) clearTimeout($(document).data('scrollStopListener'));
                $(document).data('scrollEnd', setTimeout(onScroll, event));
            });
        };
    }

    /*
    * date : 20220809
    * last : 20221101
    * name : setMoHeader()
    * pram :
    * desc : mobile header - scroll up/down
    */
    function setMoHeader() {
        var header = $('.header-wrapper[data-mobile-only]');
        if (header === undefined || header.hasClass('is-static')) return false;
        var $classList = [
                    'wrapper',
                    'header-wrapper[data-mobile-only]',
                    'docker-wrapper[data-mobile-only]',
                    'sps[data-sps]',
                ],
                offset = header.height() / 2, // scroll 사라지는 딜레이 시점을 주기 위해
                pageHeight = $_wrapper.outerHeight() - getBodyHeight() - header.outerHeight(),
                prevScrollTop = 0;

        var sensor = new ResizeSensor($_wrapper, function () {
            if (_sizeViewSta === 'mobile') {
                pageHeight = $_wrapper.outerHeight() - getBodyHeight() - header.outerHeight();
                scrollUpDown();
                if( _scrollTop === 0 ) {
                    $classList.forEach(function (target) {
                        $('.' + target).removeClass('scroll-up scroll-down');
                    });
                }
            }
        });

        createScrollStopListener(window, function () {
            if (_sizeViewSta === 'desktop') {
                $classList.forEach(function (target) {
                    $('.' + target).removeClass('scroll-up scroll-down');
                });
                return false;
            }
            else {
                scrollUpDown();
            }
        });

        // scrollUp/down check
        function scrollUpDown() {
            pageHeight = $_wrapper.outerHeight() - getBodyHeight() - header.outerHeight();
            if ($_wrapper.outerHeight() <= _resizeVh + 31) return false;

            if( _noScroll ) {
                $classList.forEach(function (target) {
                    var $target = $('.' + target);
                    if( $target.is(':animated') ) return false;
                    if (!$target.hasClass('scroll-down')) $target.removeClass('scroll-up').addClass('scroll-down');
                });
                return false;
            }

            $classList.forEach(function (target) {
                var $target = $('.' + target);

                if ( $target.hasClass('fixed') || $target.length === 0 ) return false;
                if ( $('body').hasClass('dialog-open') || $('body').hasClass('sub-layer-open') ) return false;

                // 스크롤 최상단
                if (_scrollTop === 0 || _scrollTop < 0 || _scrollTop <= offset) {
                    if ( $target.hasClass('scroll-up') || $target.hasClass('scroll-down') ) $target.removeClass('scroll-up scroll-down');
                    return false;
                } else {
                    // 스크롤 내릴	때
                    if (prevScrollTop < _scrollTop && _scrollTop > offset) {
                        if (!$target.hasClass('scroll-down')) {
                            $target.removeClass('scroll-up').addClass('scroll-down');
                        }
                    }
                    // 스크롤 올릴 때
                    else {
                        if (_scrollTop < pageHeight && _scrollTop > offset) {
                            if (!$target.hasClass('scroll-up')) {
                                $target.removeClass('scroll-down').addClass('scroll-up');
                            }
                        }
                    }

                }
            });

            prevScrollTop = _scrollTop;
            return false;
        }

    }

    /*
    * date : 20220819
    * last : 20220819
    * name : setMoAllmenu()
    * pram :
    * desc : mobile Allmenu
    */
    function setMoAllmenu() {
        var wrap = $('.mo-allmenu-popup');
        if (wrap.length === 0) return false;

        if ($('.footer-tab-wrap', wrap).length > 0) {
            $('.footer-tab-wrap', wrap).tabs({
                collapsible: true,
                active: false
            });
        }

        // 배너 swiper
        if ($('.swiper-allmenu-banner .swiper-slide').length > 1) {
            $('.swiper-allmenu-banner').addClass('is-active');
            $('.swiper-allmenu-banner', wrap).each(function () {
                var allmenuBannerSwiper = new Swiper($('.swiper-container', this), {
                    init: false,
                    speed: 250,
                    slidesPerView: 1,
                    spaceBetween: 0,
                    resistance: '100%', // swiper bounce 제거
                    resistanceRatio: 0, // swiper bounce 제거
                    touchRatio: 0.3,
                    observer: true,
                    observeParents: true,
                    pagination: {
                        el: '.swiper-allmenu-banner .swiper-pagination',
                        type: 'fraction',
                    },
                    loop: true,
                    autoHeight: true,
                });
                allmenuBannerSwiper.init();
            });

        }

        // sub menu list on/off
        $('.btn-sub-more', wrap).on('click', function () {
            $(this).closest('.sub-gate-item').toggleClass('is-active');
            foldTransition($(this).closest('.fold-item'));
        });

    }

    /*
    * date : 20220819
    * last : 20221201
    * name : setDesktopHeader()
    * pram :
    * desc : Desktop header
    */
    function setDesktopHeader() {
        const DesktopHeader = $('.header-wrapper[data-pc-only]');
        if (DesktopHeader.length === 0) return false;

        DesktopHeader.find('.gnb-dep2-menu').off('mouseenter').on('mouseenter', async function (e) {
            //if (e.type === 'mouseenter') DesktopHeader.addClass('show-sub-gnb');
            DesktopHeader.addClass('show-sub-gnb');
            pcGnbDrawCallBack(await getGnbBanner('Y'));
        });

        DesktopHeader.off('mouseleave').on('mouseleave', function (e) {
            //isHide = e.type === 'mouseleave' ? true : e.type === 'mouseleave' ? false : null;
            DesktopHeader.removeClass('show-sub-gnb');
        });
    }

    /*
    * date : 20220809
    * last : 20220809
    * name : setGateLayerOnOff()
    * pram :
    *		@param btn - 레이어 on/off control
    *		@param layer - on/off 대상
    * desc : layer on/off
    */
    function setGateLayerOnOff(btn, layer) {
        var scrollTopPos = 0;
        if ($(layer).length === 0) return false;
        if ($(btn).hasClass('is-active')) LayerOnOff('close');
        else LayerOnOff('open');

        $('.btn-sub-more', layer).on('click', function () {
            $(this).closest('.sub-gate-item').toggleClass('is-active');
        });

        function LayerOnOff(sta) {
            if (sta === 'close') {
                scrollTopPos = $('body').css('top');
                $('body').removeAttr('style');
                $('body').removeClass('sub-layer-open');
                $(window).scrollTop(-parseInt((scrollTopPos)));
                $(btn).removeClass('is-active');
                $(layer).removeClass('is-active');
                $_wrapper.removeClass('is-layer-active');
            } else if (sta === 'open') {
                $('body').css({'top': -(_scrollTop)});
                $('body').addClass('sub-layer-open');
                $(btn).addClass('is-active');
                $(layer).addClass('is-active');
                $_wrapper.addClass('is-layer-active');
            }
        }

    }

    /*
    * date : 20220809
    * last : 20220809
    * name : setGoTop()
    * pram :
    * desc : set top button
    */
    function setGoTop() {
        var offset = $_headerWrapper.length > 0 ? $_headerWrapper.height() * 1.5 : 30;
        //$_btnGoTop.addClass('is-hide');
        btnOnOff();

        $_btnGoTop.off('click').on('click', function (e) {
            e.preventDefault();
            $('html, body').stop().queue('fx', []).animate({scrollTop: 0}, 250);
        });

        
        $_btnGoTop.on(_transitionEnd, function () {
            if (!$_btnGoTop.hasClass('is-active')) $_btnGoTop.addClass('is-hide');
        })

        $(window).off('scroll', btnOnOff).on('scroll', btnOnOff);

        function btnOnOff() {
            offset = $_headerWrapper.length > 0 ? $_headerWrapper.height() * 1.5 : 30;
            if (_scrollTop >= offset) {
                if (!$_btnGoTop.hasClass('is-active')) $_btnGoTop.removeClass('is-hide').addClass('is-active');
            } else {
                if ($_btnGoTop.hasClass('is-active')) $_btnGoTop.addClass('is-hide').removeClass('is-active');
            }
        }
    }

    /*
    * date : 20220809
    * last : 20220809
    * name : moContentDocker()
    * pram :
    * desc : mobile - (단일) 컨텐츠가 도커로 변경
    */
    function moContentDockerChange() {
        var $target = $('[data-mobile-docker]'),
                $floatingWrapper = $('.floating-wrapper');

        if ($target.length === 0) return false;

        $(window).off('resize orientationchange observerUpdate', setFloatingOffsetBottom).on('resize orientationchange observerUpdate', setFloatingOffsetBottom);

        setFloatingOffsetBottom();

        var sensor = new ResizeSensor($target, function () {
            if (_sizeViewSta === 'mobile' && parseInt($floatingWrapper.attr('data-offset-bottom')) !== $target.outerHeight()) {
                $floatingWrapper.attr('data-offset-bottom', $target.outerHeight()).css('bottom', $target.outerHeight());
            }
        });

        function setFloatingOffsetBottom() {
            // mobile - bottom 위치 설정
            if (_sizeViewSta === 'mobile') {
                if ($('.wrapper').hasClass('has-content-dock')) {
                    var addPadd = $('.wrapper [data-mobile-docker]').outerHeight();
                    if( addPadd !== 0 ) {
                        $_container.css('padding-bottom', addPadd+'px');
                        //$_container.css('padding-bottom', 'calc('+addPadd+'px + env(safe-area-inset-bottom))');

                    }
                }
                if ($floatingWrapper.attr('data-offset-bottom') === undefined || parseInt($floatingWrapper.attr('data-offset-bottom')) !== parseInt($floatingWrapper.css('bottom'))) {
                    $floatingWrapper.attr('data-offset-bottom', $target.outerHeight()).css('bottom', $target.outerHeight());
                }
            }
            // desktop - 위치 해제
            else {
                if ($floatingWrapper.attr('style') !== undefined) $floatingWrapper.removeAttr('style');
                if ($_container.attr('style') !== undefined) $_container.removeAttr('style');

                if ($('.wrapper').hasClass('has-content-dock'))  {
                    if( $('.wrapper').attr('style') !== undefined ) $('.wrapper').removeAttr('style');
                }
            }
            return false;
        }

    }

    /*
    * date : 20220809
    * last : 20230112
    * name : setTableCaption()
    * pram :
    * desc : 테이블 캡션 생성
    */
    function setTableCaption() {
        $("table[class*='tbl-col'], table[class*='tbl-row'], table[class*='tbl-row-info']").each(function (index) {
            var table, captionComplex, theadHeader, tbodyHeader;
            table = $(this);
            captionTextOrigin = $(this).find("caption").text();
            captionComplex = '';
            theadHeader = [];
            tbodyHeader = [];

            // thead th값 추출
            if (table.find("thead th").length > 0) {
                table.find("thead th").each(function (index) {
                    theadHeader.push($(this).text());
                });
            }
            // tbody th값 추출
            if (table.find("tbody th").length > 0) {
                table.find("tbody th").each(function (index) {
                    // tbody th가 thead th의 서브 헤더인 경우(thead th와 tbody th가 둘 다 존재하는 경우)
                    if (theadHeader.length > 0) {
                        if (tbodyHeader[$(this).index()] === undefined) {
                            tbodyHeader[$(this).index()] = theadHeader[$(this).index()] + " 컬럼의 하위로";
                        }
                        tbodyHeader[$(this).index()] += " " + $(this).text();
                    } else {
                        tbodyHeader.push($(this).text());
                    }
                });

                tbodyHeader = tbodyHeader.filter(function (n) {
                    return n != undefined
                });
            }

            if (theadHeader.length > 0 && tbodyHeader.length > 0) {
                captionComplex += theadHeader.join(", ") + " " + tbodyHeader.join(", ");
            } else if (theadHeader.length > 0) {
                captionComplex += theadHeader.join(", ");
            } else if (tbodyHeader.length > 0) {
                captionComplex += tbodyHeader.join(", ");
            }

            $(this).find("caption").text(captionTextOrigin + " 테이블로 " + captionComplex + '을(를) 나타낸 표입니다.');
        });
    }

    /*
    * date : 20220819
    * last : 20220819
    * name : setTabs()
    * pram : selector - Tab 생성 DOM 셀렉터(default : .tab-wrap)
    * desc : jQuery UI 탭 설정
    */
    function setTabs(selector) {
        selector = selector || '.tab-wrap';
        var tabSwiper = [];

        if ($(selector).length > 0) {
            $(selector).each(function (i) {
                var disabledTabs;
                disabledTabs = [];

                if ($('.tabs-swiper').length > 0) {
                    $('.tabs-swiper', this).each(function (i) {
                        var $this = $(this);
                        if ($this[0].swiper === undefined) {
                            tabSwiper[i] = new Swiper($this, {
                                init: false,
                                slidesPerView: 'auto',
                                speed: 250,
                                freeMode: true,
                                resistance: '100%', // swiper bounce 제거
                                resistanceRatio: 0, // swiper bounce 제거
                                observer: true,
                                observeParents: true,
                                watchOverflow: true,
                            });
                            /*if($(this).closest('.tab-wrap').hasClass('sub-tab')) {

                                $this.find('.tab-item:last-child').on('click touchstart', function() {
                                    var that = $(this).closest('.tabs-swiper')[0].swiper;
                                    if( !$(that.$el).hasClass('is-end') ) $(that.$el).addClass('is-end');
                                });

                                $this[0].swiper.on('init touchEnd touchStart transitionend webkitTransitionEnd oTransitionEnd otransitionend', function () {
                                    var that = this;
                                    console.log(that.isEnd)
                                    if( that.isEnd ) {
                                        if( !$(that.$el).hasClass('is-end') ) $(that.$el).addClass('is-end');
                                    }
                                    else {
                                        if( $(that.$el).hasClass('is-end') ) $(that.$el).removeClass('is-end');
                                    }
                                });
                            }*/
                            $this[0].swiper.init();
                        }
                    });

                }

                if ($(this).hasClass('anchor-tab') || $(this).hasClass('anchor-scrollspy') ) return;

                $(this).find('> .tabs .tab-link').each(function (index) {
                    if ($(this).hasClass('tab-disabled') && $(this).hasClass('disabled')) disabledTabs.push(index);
                });

                $(this).tabs({
                    disabled: disabledTabs,
                    beforeActivate: function (event, ui) {
                        if ($(ui.newTab).find('a').attr('href').indexOf('#') !== 0) {
                            window.open($(ui.newTab).find('a').attr('href'), '_self');
                        }
                        if ($('.tabs-swiper', this).length > 0) {
                            $('.tabs-swiper', this)[0].swiper.slideTo($(ui.newTab).index());
                        }

                    },
                    create: function (event, ui) {
                    },
                    activate: function (event, ui) {

                        if (ui.newPanel.find('.ui-select').length > 0) selectBreakpointInit();

                        if($('.fold-wrap .fold-item', this).length > 0 ) setFoldBox();
                    },
                });

            });

            $(window).off('resize observerUpdate orientationchange', tabSwiperResize).on('resize observerUpdate orientationchange', tabSwiperResize);

        }

        function tabSwiperResize() {
            if (tabSwiper.length === 0) return false;
            tabSwiper.forEach(function (ele) {
                if (ele === undefined) return false;
                ele.init();
            });
        }

    }

    /*
    * date : 20220809
    * last : 20220809
    * name : setFoldBox()
    * pram : selector - Tab 생성 DOM 셀렉터(default : .fold-wrap)
    * desc : fold 설정
    */
    function setFoldBox(selector) {
        selector = selector ? selector : '.fold-wrap';
        if ($(selector).length > 0) {
            setFoldData();
            $(selector).find('.btn-fold').off('click.uiFold').on('click.uiFold', function (event) {
                if ($(event.target).is('a') || $(event.currentTarget).closest('.fold-item').is('.no-fold') || $(event.target).is('input')) return;

                var foldBox = $(this).closest('.fold-item'),
                    isExpanded = foldBox.hasClass('expanded');

                if (($(event.currentTarget).closest('.fold-list').data('type') === 'single')) {
                    var allFoldBox = $(this).closest('.fold-list').find('.fold-item.expanded');
                    if (isExpanded) {
                        allFoldBox.each(function (index) {
                            $(this).data('btn').find('.offscreen').text('컨텐츠 닫기');
                            $(this).data('btn').attr('title','컨텐츠 닫기');
                        })
                    } else {
                        allFoldBox.removeClass('expanded');
                        allFoldBox.each(function (index) {
                            $(this).data('btn').find('.offscreen').text('컨텐츠 열기');
                            $(this).data('btn').attr('title','컨텐츠 열기');
                        });
                    }
                    if(allFoldBox.length > 0 ) foldTransition(allFoldBox);
                }

                if (isExpanded) {
                    foldOnOff().foldClose(foldBox);
                } else {
                    foldOnOff().foldOpen(foldBox);
                }


                var evtData = {
                    index: $(event.currentTarget).closest('.fold-item').index(),
                    isExpanded: $(event.currentTarget).closest('.fold-item').hasClass('expanded'),
                };
                var evt = new CustomEvent('headerClick', {'detail': evtData});

                $(event.currentTarget).closest('.fold-item')[0].dispatchEvent(evt);
            });
            $(window).off('resize observerUpdate orientationchange', setFoldData).on('resize observerUpdate orientationchange', setFoldData);

            $(selector).find('.fold-content').each(function () {
                var cont = $(this);
                var sensor = new ResizeSensor(cont, function () {
                    if( cont.closest('.fold-item').hasClass('expanded') ) foldTransition(cont.closest('.fold-item.expanded'));
                });
            });
        }

        function setFoldData() {
            $(selector).find('.fold-item .fold-header').each(function (index) {
                if ( $(this).parents('.fold-item').hasClass('no-fold')) {
                    return;
                };
                var tgItem = $(this).closest('.fold-item');

                tgItem.data('btn', $(this).find('.btn-fold'));
                tgItem.css('height', 'auto');
                tgItem.css('height', tgItem.outerHeight());

            });

        }
    }

    /*
    * date : 20220809
    * last : 20220809
    * name : foldOnOff()
    * pram :
    * desc : fold On/Off
    */
    function foldOnOff() {
        var control = {
            /**
             * fold open
             * @param selector {string} 타겟 foldbox
             */
            foldOpen: function (selector) {
                selector.addClass('expanded');
                $('.btn-fold', selector).find('.offscreen').text('컨텐츠 닫기');
                $('.btn-fold', selector).attr('title','컨텐츠 닫기');
                $('.btn-fold.detail-info', selector).attr('title','상세정보 닫기');
                $('.btn-fold.prod-info', selector).attr('title','상품정보 닫기');
                $('.btn-fold.voc', selector).attr('title','고객의 소리란? 닫기');
                $('.btn-fold.voc-info', selector).attr('title','작성시 유의사항 닫기');
                if (!selector.hasClass('no-fold')) foldTransition(selector); // 폴딩 기능이 필요 없는 item 제외하고 높이 변경
            },

            /**
             * fold close
             * @param tgId {string} 타겟 foldbox
             */
            foldClose: function (selector) {
                selector.removeClass('expanded');
                $('.btn-fold', selector).find('.offscreen').text('컨텐츠 열기');
                $('.btn-fold', selector).attr('title','컨텐츠 열기');
                $('.btn-fold.detail-info', selector).attr('title','상세정보 열기');
                $('.btn-fold.prod-info', selector).attr('title','상품정보 열기');
                $('.btn-fold.voc', selector).attr('title','고객의 소리란? 열기');
                $('.btn-fold.voc-info', selector).attr('title','작성시 유의사항 열기');
                if (!selector.hasClass('no-fold')) foldTransition(selector); // 폴딩 기능이 필요 없는 item 제외하고 높이 변경
            },
        }
        return control;
    }

    /*
    * date : 20220809
    * last : 20221027
    * name : foldOnOff()
    * pram : selector - foldbox
    * desc : fold transition
    */
    function foldTransition(selector, isForce) {
        var curHeight,
            changeHeight = 0;
            isForce = isForce || false;

        curHeight = selector.outerHeight();
        selector.css('height', 'auto');
        changeHeight = selector.outerHeight();
        selector.css('height', curHeight).stop().queue('fx', []).animate({height: changeHeight}, (isForce ? 0 : 100), function () {
            var that = $(this);
            if( selector.hasClass('expanded') && that.closest('.fold-list').data('type') === 'single' && selector.offset().top < _scrollTop ) {
                _noScroll = true;
                $('html, body').stop().queue('fx', []).animate({scrollTop: that.offset().top - 50}, 250, function () { setTimeout(function() {_noScroll = false;}, 250); });
            }
        });
    }

    /*
    * date : 20220819
    * last : 20220819
    * name : setAllCheckList()
    * pram :
    * desc : 체크박스 리스트에 따라 전체 체크박스 상태 변경 기능
    */
    function setAllCheckList() {
        // 체크 요소 없으면 return
        if ($('.all-chk-wrap').length === 0 && $('.all-chk-wrap .chk').length > 0 && $('.all-chk-wrap .all-chk').length === 0) return false;

        var $wrap = $('.all-chk-wrap');
        $wrap.each(function () {
            var that = $(this);
            var $allChk = $('.all-chk input', that);
            var $Chk = $('.item-chk input', that);
            var chkLen = $Chk.length;

            $Chk.off('change').on('change', function () {
                if ($('.item-chk input:checked', that).length === chkLen) { // 전체 선택했을 경우 - all checkbox 활성화
                    $allChk.prop('checked', true);
                    that.addClass('is-all-check');
                }
                else {
                    $allChk.prop('checked', false);
                    that.removeClass('is-all-check');
                }

            });

            $allChk.off('change').on('change', function () {
                if ($allChk.prop('checked') === true) {
                    $Chk.not(':disabled').prop('checked', true);
                    that.addClass('is-all-check');
                }
                else {
                    $Chk.prop('checked', false);
                    that.removeClass('is-all-check');

                }
            });
        });
    }

    /*
    * date : 20220822
    * last : 20221019
    * name : setDatepicker()
    * pram :
    * desc : jQuery UI Datepicker 생성
    */
    function setDatepicker(selector) {
        selector = selector || '.date-box';

        $.datepicker.setDefaults({
            dateFormat: 'yy.mm.dd',
            monthNames: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'],
            monthNamesShort: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'],
            dayNamesMin: ['일', '월', '화', '수', '목', '금', '토'],
            showOn: 'button',
            buttonText: '날짜 선택',
            currentText: '오늘',
            showMonthAfterYear: true,
            buttonImageOnly: false,
            changeMonth: true,
            changeYear: true,

        });

        if ($(selector).length > 0) {
            $('input', selector).each(function (index) {
                var minDate,
                    maxDate,
                    isDisabled,
                    elem = $(this);
                minDate = $(this).data('minDate') !== undefined ? $(this).data('minDate') : null;
                maxDate = $(this).data('maxDate') !== undefined ? $(this).data('maxDate') : null;
                isDisabled = $(this).attr('disabled');

                elem.off('input').on('input', function (event) { this.value = this.value.replace(/[\ㄱ-ㅎㅏ-ㅣ가-힣]/g, ''); });

                elem.datepicker({
                    minDate: minDate,
                    maxDate: maxDate,
                    disabled: isDisabled,
                    gotoCurrent: true,
                    beforeShow: function (input, inst) {
                        $(input).attr('inputmode', 'none').blur();
                        setTimeout(function () {
                            inst.dpDiv.position({
                                my: 'right top+6',
                                at: 'right bottom',
                                of: input
                            });
                        }, 1);
                    },
                    onSelect: function (input, inst) {
                        inst.input.prop('disabled', true).blur(); // 팝업 열림 시 input focus 막기
                    },
                    onClose: function (dateText, inst) {
                        inst.input.prop('disabled', false).removeAttr('inputmode').blur();
                        if (dateText && dateText.length === 8) {
                            $(this).datepicker('setDate', new Date(dateText.substring(0, 4), dateText.substring(4, 6) - 1, dateText.substring(6, 8)));
                        }
                        // onClose 시 날짜형식을 유지하도록 하는 트릭
                        $(this).datepicker('option', 'dateFormat', $(this).datepicker('option', 'dateFormat'));
                    },
                });

                elem.on('touchend', function() {
                    $(this).removeAttr('inputmode');
                });

            });
        }
    }

    /*
    * date : 20220809
    * last : 20220809
    * name : setTextareaFocus()
    * pram :
    * desc : byte check 하는 textarea 인 경우, focus 시, parent 에 is-focus class 추가
    */
    function setTextareaFocus() {
        if ($('.byte-check-wrap').length > 0) {
            $('.byte-check-wrap').each(function () {
                var input;
                if ($(this).find('.ui-textarea').length > 0) input = $(this).find('.ui-textarea');
                else input = $(this).find('.ui-input');

                input.on({
                    'focusin': function () {
                        $(this).parent().addClass('is-focus');
                    },
                    'focusout': function () {
                        $(this).parent().removeClass('is-focus');
                    },
                });
            });
        }
    }

    /**
     * 팝업이 오픈된 뒤 실제 브라우저 렌더링이 된 후 swiper 업데이트를 위한 재귀함수
     */
    function updateDialogSwiper(dialog) {
        if (dialog.clientWidth > 0) {
            if (dialog.swiper !== undefined) dialog.swiper.update();
        } else {
            setTimeout(function () { updateDialogSwiper(dialog); }, 10);
        }
    }

    /*
    * date : 20220819
    * last : 20220819
    * name : setUIDialog()
    * pram :
    *		@param selector {string} 레이어 팝업으로 생성할 컨테이너 셀렉터(default: .ui-dialog-contents)
    * desc : 레이어 팝업 설정 (jquery UI Dialog)
    */
    function setUIDialog(selector) {
        selector = selector || '[data-role=dialog]';

        if ($(selector).length > 0) {
            var dialogClass, containerId, dialogId, containerClasses;

            $(selector).each(function () {
                if ($(this).parents('.ui-dialog').length > 0) return false;

                containerId = 'body';
                containerClasses = 'ui-dialog-container';
                dialogClass = '';

                // dialog pc multi class 추가
                if ($(this).data('class') !== undefined) {
                    if (isNaN(parseInt($(this).data('class')))) {
                        dialogClass = $(this).data('class');
                    }
                }

                // resize시, popup 가운데 정렬 css제어를 위해 container append
                dialogId = containerId.replace('#', '') + 'Dialog' + _dialogCount;
                $(containerId).append('<div id="' + dialogId + '" class="' + containerClasses + '"></div>');

                _dialogCount++;

                // 팝업 기본 설정
                $(this).dialog({
                    appendTo: containerId + ' #' + dialogId, // resize시, popup 가운데 정렬 css제어를 위해 container append
                    autoOpen: false,
                    minHeight: 'none',
                    closeText: '닫기',
                    modal: true,
                    resizable: false,
                    draggable: false,
                    position: null,
                    width: 'auto',
                    classes: {
                        // popup case multi class 추가,
                        'ui-dialog': 'ui-corner-all ' + dialogClass, // popup case multi class 추가
                    },
                    open: function (event, ui) {
                        var that = $(this);
                        var container = that.closest('.ui-dialog-container');

                        container.find('.ui-dialog-content').removeAttr('style');
                        // 팝업 닫기 시, 기존 스크롤 위치로 이동위해 현재 스크롤값 저장(상단 이동 막기)
                        if (that.data('class') !== 'ui-no-dim' && $(this).data('class') !== 'dialog-main') {
                            var scrollTop = $(document).scrollTop();
                            var bodyWidth = $('body').outerWidth();
                            if( _sizeViewSta === 'desktop' ) {
                                $('body').css({width: bodyWidth});
                                if( window.innerWidth-bodyWidth > 0 ) $('.floating-wrapper').css('padding-right', ( window.innerWidth-bodyWidth) + 'px');
                            }
                            //else if ( _sizeViewSta === 'mobile' ) $('body').css({top: -scrollTop});

                            $('body').addClass('dialog-open');
                        }

                        //팝업 2개 이상 노출 시 z-index 지정(팝업 위 팝업 미구현시 삭제)
                        var zNum = 100;
                        container.addClass('open').css('z-index', zNum + 2);

                        if ($(".ui-dialog-container:visible").length > 0) {
                            $(".ui-dialog-container:visible").each(function (i) {
                                /*zNum = Math.max(zNum, that.css('z-index'));*/
                                container.addClass('open').css('z-index', zNum + i);
                            });
                        }

                        // 팝업 내 swiper 업데이트
                        if ($(this).parent().find('.swiper-container').length > 0) {
                            $(this).parent().find('.swiper-container').each(function (index) {updateDialogSwiper(this);});
                        }
                        $(window).on('resize', function () { dialogPosition(); });

                        function dialogPosition() {
                            var flag = undefined;

                            if (that.is(':visible')) {
                                flag = that.data('class') === 'dialog-bottom ' ? 'dialog-bottom ' : that.data('class') === 'dialog-full' ? 'dialog-full' : undefined;
                                if( flag === undefined ) return false;
                                if (_sizeViewSta === 'desktop' && $(containerId).hasClass(flag) ) {
                                    $(containerId).removeClass(flag);
                                } else if (_sizeViewSta === 'mobile' && !$(containerId).hasClass(flag) ) {
                                    $(containerId).addClass(flag);
                                }
                            }
                        }

                        dialogPosition();
                        setFoldBox();

                        if( that.data('class') === undefined ) {
                            container.find('.ui-widget-overlay').on('click', function () {that.dialog('close');});
                        }
                        else {
                            if(that.data('class').indexOf('no-dim-close') < 0 ) {
                                container.find('.ui-widget-overlay').on('click', function () {that.dialog('close');});
                            }
                        }

                        // 알림팝업 데스크탑일때 none 처리
                        if ($('.notice-history-popup').length > 0 && $('.notice-history-popup').parents('.ui-dialog-container').hasClass('open')) {
                            if ($(window).width() >= _desktopWidth) {
                                $(selector).dialog('close')
                            }
                        }
                    },
                    close: function () {
                        var that = $(this);
                        var container = that.closest('.ui-dialog-container');
                        var scrollTopPos = $('body').css('top');
                        var isFloatingOpen = false;
                        var isMainOpen = false;
                        var isCloseChk = $("#popCloseMethodCode").val() == "NEVER" ? false : true;

                        if (isCloseChk) {

                            // z-index style 삭제
                            container.removeClass('open').removeAttr('style');
                            $('.ui-dialog-content').each(function () {
                                if ($(this).is(':visible') && $(this).data('class') === 'ui-no-dim') isFloatingOpen = true;
                                if ($(this).is(':visible') && $(this).data('class') === 'dialog-main') isMainOpen = true;
                            });

                            // 팝업 닫기 시, 기존 스크롤 위치로 이동(상단 이동 막기)
                            if ($('.ui-dialog-content:visible').length === 0) {
                                $('body').removeAttr('style');
                                $(containerId).removeClass('dialog-open');
                                if (_sizeViewSta === 'desktop') {
                                    $('body').removeClass('style');
                                    $('.floating-wrapper').css('padding-right', 0);
                                }
                                //else if ( _sizeViewSta === 'mobile' ) $(window).scrollTop(-parseInt(scrollTopPos));

                            }

                            // 풀팝업 높이값 설정
                            if (that.data('class') === 'dialog-full' && $(containerId).hasClass('dialog-full')) {
                                that.parent().css('height', 'auto');
                            }

                        }
                    }
                });

                // 딤드 없는경우 modal false 처리
                if ($(this).data('class') === 'no-dim') {
                    $(this).dialog({modal: false});
                }
            });
        }
    }

    function isAllowDisplayPop(id) {
        const pdlc = $('#' + id).attr('data-pdlc');
        let papa = $('#' + id).attr('data-paData');
        papa = !papa ? '' : papa;

        if (getCookie(id + pdlc + papa) == 'Y') {
            return false;
        }
        return true;
    }

    function blockPop(id, days) {
        const pdlc = $('#' + id).attr('data-pdlc');
        let papa = $('#' + id).attr('data-paData');
        papa = !papa ? '' : papa;

        setCookieTimeZero(id + pdlc + papa, 'Y', days);
    }

    /*
    * date : 20220809
    * last : 20220809
    * name : dialogOnOff()
    * pram :
    * desc : 레이어 팝업 On/Off(외부 호출용)
    */
    function dialogOnOff() {
        var control = {
            /**
             * 레이어팝업 open
             * @param tgId {string} 팝업 타겟 id
             * @param callback {string} 팝업 open 후 callback 함수
             */
            popOpen: function (tgId, callback, arg) {
                if (!isAllowDisplayPop(tgId.substring(1))) {
                    return false;
                }
                if ($(tgId).data('mobile-popup') === undefined && $(tgId).data('pc-popup') === undefined ) $(tgId).dialog('open');
                else if ($(tgId).data('mobile-popup') !== undefined && _sizeViewSta === 'mobile') $(tgId).dialog('open');
                else if ($(tgId).data('pc-popup') !== undefined && _sizeViewSta === 'desktop') $(tgId).dialog('open');

                if (callback != null && typeof callback === "function") callback.apply(null, [tgId, arg]);
                return true
            },

            /**
             * 레이어팝업 close
             * @param tgId {string} 팝업 타겟 id
             */
            popClose: function (tgId, callback, arg, blockDays) {
                if (!!blockDays) {
                    blockPop(tgId.substring(1), blockDays);
                }
                $(tgId).dialog('close');
                //floatingBtnToggle();
                if (callback != null && typeof callback === "function") {
                    callback.apply(null, [tgId, arg]);
                }
            }
        }

        return control;
    }

    /**
     * select init
     * @param selector {string} 실행 element
     */
    function setUISelect(selector) {
        selector = selector || '.ui-select';

        var appendToClass = [
            '.ui-dialog',
            '.fold-payment-method .payment-method-body',
            '.cont-order-wrap',
        ];

        if ($(selector).length > 0) {

            $(selector).each(function () {
                var elem = $(this);
                var selectMenuOption, typePosition;
                selectMenuOption = {};

                typePosition = {my: 'left top', at: 'left bottom'};
                //if( elem.data('renderer') === 'selInteriorOpt' ) typePosition = {my: 'center bottom', at: 'center top'};
                if (elem.data('pos-top') !== undefined) {
                    typePosition = {my: 'center bottom', at: 'center top'};
                    selectMenuOption.classes = {
                        'ui-selectmenu-menu': 'pos-top'
                    }
                } else if (elem.data('text') !== undefined) {
                    typePosition = {my: 'right top', at: 'right bottom'};
                    selectMenuOption.classes = {
                        'ui-selectmenu-menu': 'menu-text'
                    }
                }

                selectMenuOption.position = typePosition;

                appendToClass.forEach(function (value) {
                    if (elem.closest(value).length > 0) {
                        if( value === '.cont-order-wrap' ) {
                            selectMenuOption.appendTo = elem.closest('.cont-box');
                        }
                        else if( value === '.ui-dialog' ) {
                            //selectMenuOption.appendTo = elem.closest('.ui-dialog-container');
                            selectMenuOption.appendTo = $('body');
                            /*selectMenuOption.open = function (event, ui) {
                                elem.closest('.ui-dialog').css('zIndex', 100 );
                            }*/
                        }
                        else {
                            selectMenuOption.appendTo = elem.closest(value);

                        }

                    }
                })


                selectMenuOption.create = function (event, ui) {
                    var that, instance, menuWidth;
                    that = this;
                    instance = $(that).selectmenu('instance');
                    if( elem.closest('.ui-dialog').length > 0 ) return false;

                    $(that).selectmenu('open');

                    btnWidth = instance.button.outerWidth();
                    menuWidth = instance.menu.closest('.ui-selectmenu-menu').outerWidth();
                    if (btnWidth !== menuWidth) instance.menu.closest('.ui-selectmenu-menu').css('width', btnWidth);

                    $(that).selectmenu('close');
                };


                $(this).find('select').selectmenu(selectMenuOption);
            });

        }

    }

    /**
     * select reinit
     * @param selector {string} 실행 element
     */
    function setSelectReInit(selector) {
        selector = selector || '.ui-select';
        if ($(selector).length > 0) {
            callSelectDestroy();
            $(selector).each(function () {
                setUISelect($(this));
            });
        }
    }

    /*
     * date : 20220809
     * last : 20220809
     * name : openSelectClose()
     * desc : scroll, resize, dialog open 시 select close
    */
    function openSelectClose() {
        $('.ui-select .ui-selectmenu-button-open').each(function (index) {
            $(this).closest('.ui-select').find('select').selectmenu('close');
        });
    }

    /**
     * selectmenu refresh
     */
    function callSelectRefresh(tgId) {
        var select = tgId || $('.ui-select select');
        if( !$(select).is(':visible') && $(select).length > 0 ) {
            $(select).each(function (index) { $(this).selectmenu('refresh'); });
        }
    }

    /**
     * selectmenu Destroy
     */
    function callSelectDestroy() {
        if ($('.ui-select .ui-selectmenu-button').length > 0) {
            $('.ui-select').each(function (index) {
                $(this).find('select').selectmenu('destroy');
            });
        }
    }

    /*
     * date : 20220809
     * last : 2021202208090914
     * name : selectBreakpointReInit
     * desc : PC - jquery UI selectmenu , MO - 기본 셀렉트
    */
    function selectBreakpointInit(selector) {
        selector = selector || '.ui-select';

        if (_sizeViewSta === 'desktop') {
            setSelectReInit();
        } else {
            callSelectDestroy();
        }
    }

    /*
    * date : 20220809
    * last : 20220809
    * name : dialogOnOff()
    * pram :
    *		 @param number {number} 정수 숫자 값
    *		 @param digits {number} 자릿수(defalut: 2)
    *		 @returns {string} 치환 된 문자열
    * desc : 숫자 number에 대해 n 자릿수 문자열로 치환하여 반환
    */
    function setPrependZero(number, digits) {
        number = number + '';
        digits = digits || 2;
        return number.length >= digits ? number : new Array(digits - number.length + 1).join('0') + number;
    }

    /*
    * date : 20220809
    * last : 20220809
    * name : dialogOnOff()
    * pram :
    * desc : jQuery UI Spinner
    */
    function setUISpinner(selector) {
        selector = selector || '.ui-spinner';

        if ($(selector).length > 0) {
            $(selector).each(function () {
                var isDisabled = $(this).attr('disabled');

                if( $(this).spinner('instance') === undefined ) {
                    $(this).spinner({
                        decreseText: '수량 한 개 줄이기',
                        increseText: '수량 한 개 늘리기',
                        min: $(this).data('min') === undefined ? 0 : $(this).data('min'),
                        max: $(this).data('max'),
                        disabled: isDisabled,
                    });
                    $(this).closest('.ui-corner-all').append('<span class="count">'+parseInt($(this).val())+'</span>');
                    $(this).siblings('.count').text( parseInt($(this).attr('aria-valuenow')) );
                    $(this).on('spin', function (event) {
                        var ele = $(this);
                        setTimeout(function () {
                            ele.siblings('.count').text( parseInt(ele.attr('aria-valuenow')) );
                        }, 1);

                    });

                    $(this).on('spinchange', function (event) {
                        var ele = $(this);
                        setTimeout(function () {
                            ele.siblings('.count').text( parseInt(ele.attr('aria-valuenow')) );
                        }, 1);

                    });
                }

            });

        }
    }

    /*
    * date : 20220809
    * last : 20220809
    * name : maxLengthCheck( )
    * pram :
    * desc : input number type maxlength 지정
    */
    function maxLengthCheck() {
        $('.num-maxlength').each(function () {
            var maxNum = $(this).data('maxlength');
            if (maxNum !== undefined) {
                $(this).on('input', function () {
                    if (this.value.length > maxNum) {
                        this.value = this.value.slice(0, maxNum);
                        $(this).val(this.value.slice(0, maxNum));
                    }
                })
            }
        });
    }

    /*
    * date : 20220809
    * last : 20220809
    * name : setSpsOffsetData()
    * pram :
    * desc : 스크롤 동작시 해당 요소에 도착하면 고정
    */
    function setSpsOffsetData() {
        if ($('[data-pc-sps]').length === 0 && $('[data-mobile-sps]').length === 0 && $('[data-sps]').length === 0) return false;
        var ignoreClassList = [
            // 'header_wrapper',
        ];
        var spsElem = $('[data-sps], [data-pc-sps], [data-mobile-sps]', $_container);
        init();

        $(window).on('resize', init);

        // heightChangeTarget.forEach(function (target, idx) {
        // 	var sensor = null;
        // 	sensor = new ResizeSensor( $('.' + target), function() {
        // 		fixData( $('.sps[data-height-change='+heightChangeTarget[idx]+']') );
        // 	});
        // });
        var sensorContents = new ResizeSensor($('.cont-box', $_container), function () {
            $('.sps').each(function (i) {
                var that = this;
                setTimeout(function () {
                    fixData($(that));
                }, 100);
            })
        });

        $(window).off('scroll', moFixReData).on('scroll', moFixReData);

        var scrollSta;

        function moFixReData() {
            if ($('.wrapper').hasClass('scroll-up') && scrollSta !== 'scroll-up') {
                $('.sps').each(function (i) {
                    var that = this;
                    scrollSta = 'scroll-up';
                    //fixData($(that));
                })


            } else if ($('.wrapper').hasClass('scroll-down') && scrollSta !== 'scroll-down') {
                $('.sps').each(function (i) {
                    var that = this;
                    scrollSta = 'scroll-down';
                    //fixData($(that));
                })
            }
        }

        function fixData(tg) {
            var observerCont,
                addOfs;
            if (tg.siblings('.sps-observer').length === 0) tg.after('<div class="sps-observer"></div>');

            observerCont = tg.siblings('.sps-observer');
            addOfs = (tg.data('add-offset') !== undefined && !isNaN(tg.data('add-offset'))) ? tg.data('add-offset') : 0;

            if (_sizeViewSta === 'mobile' && scrollSta === 'scroll-up' && parseInt(tg.attr('data-sps-offset')) !== Math.round(observerCont.offset().top - $_headerWrapper.outerHeight() - addOfs)) {
                tg.attr('data-sps-offset', Math.round(observerCont.offset().top - $_headerWrapper.outerHeight() - addOfs));

            }
            else if (parseInt(tg.attr('data-sps-offset')) !== Math.round(observerCont.offset().top - addOfs)) {
                tg.attr('data-sps-offset', Math.round(observerCont.offset().top - addOfs));
            }
        }

        function init() {

            // container_wrapper > sps 엘리먼트 타겟팅
            if ((_sizeViewSta === 'desktop' && $(spsElem).attr('data-pc-sps') === 0) && (_sizeViewSta === 'mobile' && $(spsElem).attr('data-mobile-sps') === 0)) return false;

            spsElem.each(function (i) {
                var that = this, isIgnore;
                isIgnore = ignoreClassList.some(function (element) {
                    return $(that).hasClass(element);
                });
                if (!isIgnore) {
                    //spsElem.push(that);
                    // PC
                    if (_sizeViewSta === 'desktop' && $(that).attr('data-pc-sps') !== undefined) {
                        //console.log( $(that).attr('data-pc-sps') );
                        $(that).addClass('sps');
                        fixData($(that));
                        ScrollPosStyler.init();
                    }
                    else if (_sizeViewSta === 'mobile' && $(that).attr('data-mobile-sps') !== undefined) {
                        $(that).addClass('sps');
                        fixData($(that));
                        ScrollPosStyler.init();
                    }
                    else if ($(that).attr('data-sps') !== undefined) {
                        $(that).addClass('sps');
                        fixData($(that));
                        ScrollPosStyler.init();
                    }else {
                        $(that).removeClass('sps sps-abv sps-blw');
                    }

                }

            });
        }
    }

    /*
    * date : 20220809
    * last : 20221012
    * name : setDesktopAsideFixfooter()
    * pram :
    * desc : PC - Aside 고정 영역 하단 도달시 고정 해제
    */
    function setDesktopAsideFixfooter() {
        var $asideWrap = $('.aside-content-wrap');
        var footerOffset = 0;
        var asideHeight = 0;

        if($asideWrap.find('.aside-wrap [data-pc-sps]').length > 0 ) {
            asideHeight = saveHeight();

            if( $('.cont-body', $asideWrap).innerHeight() - asideHeight < 15  ) {
                $asideWrap.addClass('is-fix-bottom');
                return false;
            }

            if( $asideWrap.hasClass('cont-prod-detail') ) footerOffset = $asideWrap.offset().top + $asideWrap.innerHeight();
            else footerOffset = $asideWrap.offset().top + $asideWrap.find('.cont-body').innerHeight();

            var wrapSensor = new ResizeSensor( $asideWrap, scrollInit);
            var asideSensor = new ResizeSensor( $asideWrap.find('.aside-wrap [data-pc-sps]'), scrollInit);
            $(window).off('scroll', footerFixControl).on('scroll', footerFixControl);
            footerFixControl();
        }

        function scrollInit() {
            asideHeight = saveHeight();

            if( $('.cont-body', $asideWrap).innerHeight() - asideHeight < 15 ) {
                $asideWrap.removeAttr('data-footer-offset');
                $asideWrap.addClass('is-fix-bottom');
                footerOffset = 0;
                return false;
            }

            if( $asideWrap.hasClass('cont-prod-detail') ) footerOffset = $asideWrap.offset().top + $asideWrap.innerHeight();
            else footerOffset = $asideWrap.offset().top + $asideWrap.find('.cont-body').innerHeight();
            $asideWrap.attr('data-footer-offset', footerOffset);
            footerFixControl();
        }

        function saveHeight() {
            var height =  0;
            $asideWrap.find('.aside-wrap [data-pc-sps]').addClass('auto-height');
            height = $asideWrap.find('.aside-wrap [data-pc-sps]').outerHeight(true);
            $asideWrap.find('.aside-wrap [data-pc-sps]').removeClass('auto-height');
            return height;
        }

        function footerFixControl() {
            if( (_scrollTop + asideHeight) >= footerOffset ) {
                $asideWrap.addClass('is-fix-bottom');
            } else {
                $asideWrap.removeClass('is-fix-bottom');
            }
        }
    }

    /*
    * date : 20220809
    * last : 20220809
    * name : contentScrollMove()
    * pram :
     * desc : 해당 컨텐츠 영역으로 스크롤 이동
    */
    function contentScrollMove(target) {
        if (target.length === 0) return false;
        var movePos = target.offset().top;
        var exceptValue = $_headerWrapper.length > 0 ? $_container.data('top-padding').outerHeight() : 0;

        $('html, body').stop().queue('fx', []).animate({
            scrollTop: movePos - exceptValue
        }, 200, function () {
        });
    }

    /*
    * date : 20221101
    * last : 20221101
    * name : snsLinkLayer()
    * pram :
     * desc : footer sns link layer on/off
    */
    function snsLinkLayer() {
        var $snsWrap = $('.sns-link-list');

        var control = {
            on: function (btn) {
                var item = btn.closest('.sns-link-item');
                if( $snsWrap.length === 0 && item.length === 0 ) return false;
                if( !item.hasClass('is-active') ) {
                    $snsWrap.find('.sns-link-item.is-active').removeClass('is-active');
                    item.addClass('is-active');
                } else {
                    item.removeClass('is-active');
                }
            },
            off: function (btn) {
                var item = btn.closest('.sns-link-item');
                if( $snsWrap.length === 0 && item.length === 0 ) return false;
                if( item.hasClass('is-active') ) item.removeClass('is-active');
            },
        };

        return control;
    }

    // sps set
    if (window.ScrollPosStyler) {
        ScrollPosStyler.init({
            classAbove: 'sps-abv',
            classBelow: 'sps-blw',
        });
    }

    $(document).on("touchstart", function (e) {
        _fisHeight = window.innerHeight;
    });

    createScrollStopListener(window, function () {
        if ($('.ui-dialog-container.open').length > 0) return false;
        if (_isIos && _isMac && window.innerHeight !== _fisHeight) {
            _resizeVh = (window.innerHeight + 1);
            document.documentElement.style.setProperty('--reVh', _resizeVh + 'px');
        } else if (_isAndroid && window.outerHeight !== _fisHeight) {
            _resizeVh = window.outerHeight;
            document.documentElement.style.setProperty('--reVh', _resizeVh + 'px');
        }
    });

    /*
    * date : 20220809
    * last : 20230106
     * name : setIpFocusBlur( )
     * pram :
     * desc : ios safari 키패드 노출시 스크롤 이슈 처리
    */
    function setIpFocusBlur() {
        var isInputTouch = false;

        $('textarea, input').on("touchend", function () {
            isInputTouch = true;
        });

        createScrollStopListener(window, function () {
            if (_sizeViewSta === 'mobile' && !$('body').hasClass('dialog-open') ) {
                if ( $(':focus').is('textarea, input') && !$(':focus').is('input[type="email]"') && !isInputTouch ) {
                    $(':focus').blur();
                }
                else {
                    isInputTouch = false;
                }
            }

        });
    }

    /*
    * date : 20220809
    * last : 20220809
    * name : breakpointChangeInit()
    * pram :
     * desc : breakpoint 변경될때 초기화
    */
    function breakpointChangeInit() {
        // desktop
        if (_resizeVw > _desktopWidth) {
            if (!$('body').hasClass('desktop') || $_headerWrapper === undefined) {
                $('body').addClass('desktop');
                $_headerWrapper = $('.header-wrapper[data-pc-only]');
                $_container.data('top-padding', $_headerWrapper.outerHeight());
                _sizeViewSta = 'desktop';
            }

        }
        // mobile
        else {
            if ($('body').hasClass('desktop') || $_headerWrapper === undefined) {
                $('body').removeClass('desktop');
                $_headerWrapper = $('.header-wrapper[data-mobile-only]');
                $_container.data('top-padding', $_headerWrapper.outerHeight());
                _sizeViewSta = 'mobile';
            }

        }
    }

    function getBodyHeight() {
        var myHeight = 0;
        if (typeof (window.innerHeight) == 'number') myHeight = window.innerHeight;
        else if (document.documentElement && (document.documentElement.clientWidth || document.documentElement.clientHeight)) myHeight = document.documentElement.clientHeight;
        else if (document.body && (document.body.clientWidth || document.body.clientHeight)) myHeight = document.body.clientHeight;
        return myHeight;
    }


    function setPropertyVh() {
        document.documentElement.style.setProperty('--vh', _vh + 'px');
        document.documentElement.style.setProperty('--reVh', _resizeVh + 'px');
    }

    /*
    * date : 20220819
    * last : 20220819
    * name : toastPopupActive()
    * pram :
    * 		@param selector {string} 토스트팝업으로 사용할 셀렉터, 클래스만 사용 (default: .toast-popup)
    * 		@param msg {string} 나타낼 메세지
    * desc : 토스트 팝업 활성화 (jquery)
    */
    function toastPopupActive( msg, selector) {
        var defaultValue = selector || 'toast-popup',
            targetElement = $('<div>', {'class': defaultValue}),
            createMessage = $('<div>', {'class': 'toast-inner'}),
            msg = $(createMessage).html(msg);

        targetElement.append(msg);

        // 팝업 삽입
        $('body').append(targetElement).show();

        // 팝업 속도 조절
        targetElement
                .show()
                .delay(1000)
                .fadeOut(1000)
                .prev('.' + defaultValue).remove(); // 중복 메세지 방지

        setTimeout(function () {
            targetElement.remove();
        }, 2000)
    }

    /*
    * date : 20220819
    * last : 20220819
    * name : popoverPopupActive()
    * pram :
    * 		@param wrap {string} 부모 셀렉터
    * 		@param msg {string} 나타낼 메세지
    * desc : 토스트 팝업 활성화 (jquery)
    */
    function popoverPopupActive(wrap, msg, direction, timer) {
        var defaultValue = 'popover-popup',
            targetElement = $('<div>', {'class': defaultValue}),
            createMessage = $(targetElement).html('<div class="popover-text">'+msg+'</div>'),
            timeout = timer || 3000;
        if( direction !== undefined ) {
            targetElement.addClass('pos-'+direction);
        }

        if( $(wrap).length === 0 ) return false;

        if( $(wrap).find('.popover-popup').length === 0 ) {
            $(wrap).append(createMessage).show();
            setTimeout(function () {
                createMessage.remove();
            }, timeout);
        }
        // 팝업 삽입


    }

    /**
    * date : 20220819
    * last : 20220819
    * name : toastPopupMessage()
    * pram :
    * 		@param message01 {string} 나타낼 메세지
    * 		@param selector {string} 토스트팝업으로 사용할 셀렉터, 클래스만 사용 (default: .toast-popup)
    * desc : 토스트 팝업 활성화 (jquery)
    */
    function toastPopupMessage(message, selector) {
        var defaultValue = '.toast-popup-message',
            targetElement = selector !== 'undefined' && typeof (selector) === 'string' && selector !== '' ? selector : defaultValue,
            splitElement = targetElement.split('.'),
            createMessage = $("<div>" + message + "</div>").addClass(splitElement[1]);

        // 팝업 삽입
        $('body').append(createMessage).show();
        // 팝업 속도 조절
        // createMessage
        //     .show()
        //     .delay(1000)
        //     .fadeOut(1000)
        //     .prev(targetElement).remove(); // 중복 메세지 방지

        setTimeout(function () {
            // createMessage.remove();
        }, 2000)
    }


    /**
    * date : 20220819
    * last : 20220819
    * name : setInputStatus()
    * desc : input 상태 변경 (jquery)
    */
    function setInputStatus() {
        var $targetInput = $('.ui-input'),
                $_targetButton = $('.btn-input-del');

        if ($targetInput.length > 0) {
            $targetInput.off('keyup mouseenter').on('keyup mouseenter', function (e) {
                if (e.type === 'keyup') {
                    inputActive(this);
                }
            });
            $_targetButton.on('click', function () {
                $(this).closest('.input-box').find('.ui-input').val('');
                $(this).closest('.input-box').removeClass('has-value');
            });
            $targetInput.each(function () {
                inputActive(this);
            });
        }

        function inputActive(tg) {
            if ($(tg).val().length > 0) {
                $(tg).closest('.input-box').addClass('has-value');
            } else {
                $(tg).closest('.input-box').removeClass('has-value');
            }
        }
    }

    /**
    * date : 20220819
    * last : 20220819
    * name : setTextareaStatus()
    * desc : textarea 상태 변경 (jquery)
    */
    function setTextareaStatus() {
        var $targetTextarea = $('.ui-textarea');

        if ($targetTextarea.length > 0) {
            $targetTextarea.off('keyup focusin focusout').on('keyup focusin focusout', function (e) {
                if (e.type === 'keyup') {
                    textareaActive(this);
                }else if(e.type === 'focusin') {
                    $(this).closest('.textarea-box').addClass('is-focus');
                }else if(e.type === 'focusout') {
                    $(this).closest('.textarea-box').removeClass('is-focus');
                }
            });
            $targetTextarea.each(function () {
                textareaActive(this);

                if( $(this).is(':disabled') ) $(this).closest('.textarea-box').addClass('disabled');
            });
        }

        function textareaActive(tg) {
            if ($(tg).val().length > 0) {
                $(tg).closest('.textarea-box').addClass('has-value');
            } else {
                $(tg).closest('.textarea-box').removeClass('has-value');
            }
        }
    }

    /**
     * togglePassword : 비밀번호 숨김/보임 toggle
     * @param wrap {string} 실행 대상 element
     * @param btnSelector {string} 실행 button
     */
    function setTogglePassword(wrap, btnSelector) {
        wrap = wrap || '.form-ip-pw';
        btnSelector = btnSelector || '.btn-toggle-pw';

        var that, toggleInput, btnBeforeText, btnAfterText;
        $(btnSelector).each(function (index) {
            that = $(this);
            if (that.closest(wrap).find('input').prop('disabled')) that.attr("disabled", true);

            that.off('click').on('click', function () {
                toggleInput = $(this).closest(wrap).find('input');
                btnBeforeText = $(this).text();

                if ($(this).hasClass('is-active') && toggleInput.attr('type') === 'text') {
                    $(this).removeClass('is-active');
                    toggleInput.attr('type', 'password');

                    btnAfterText = btnBeforeText.replace('보임', '숨김');
                    $(this).find('.offscreen').text(btnAfterText);
                } else {
                    $(this).addClass('is-active');
                    toggleInput.attr('type', 'text');

                    btnAfterText = btnBeforeText.replace('숨김', '보임');
                    $(this).find('.offscreen').text(btnAfterText);
                }
            });
        });
    }

    /**
    * date : 20220819
    * last : 20220819
    * name : toggleOnOff()
    * @param wrap {string} 실행 대상 element
    * @param textChange : 기본값 false 텍스트 변경 안할경우 false
    * desc : 해당 셀렉터를 대상으로 열림, 닫힘 토글 (jquery)
    */
    function toggleOnOff(selector, target, textChange = true) {
        var textChange = textChange;
        var btnChangeTextTarget = $(target).find('.text');
        var btnBeforeText = btnChangeTextTarget.html();
        var btnAfterText;
        $(target)
                .toggleClass('active')
                .parents()
                .find(selector)
                .toggleClass('active');

        if ($(selector).hasClass('active')) {
            $(selector).attr('tabindex', -1).focus();

            if (Boolean(btnBeforeText.match('열기'))) {
                btnAfterText = btnBeforeText.replace('열기', '닫기');
            }else if (Boolean(btnBeforeText.match('더보기'))) {
                btnAfterText = btnBeforeText.replace('더보기', '접기');
            }

        } else {
            $(selector).attr('tabindex', '');

            if (Boolean(btnBeforeText.match('닫기'))) {
                btnAfterText = btnBeforeText.replace('닫기', '열기');
            }else if (Boolean(btnBeforeText.match('접기'))) {
                btnAfterText = btnBeforeText.replace('접기', '더보기');
            }
        }
        if ( textChange == true && btnChangeTextTarget.length > 0 ) {
            btnChangeTextTarget.html(btnAfterText);
        }
    }

    /**
    * date : 20220824
    * last : 20220824
    * name : toggleOffscreenOnOff()
    * @param wrap {string} 실행 대상 element
    * desc : 해당 셀렉터를 대상으로 열림, 닫힘 토글 (jquery)
    * desc : offscreen 텍스트 자동 치환
    */
    function toggleOffscreenOnOff(selector, target) {
        var isMatch = false;
        var btnChangeTextTarget = $(target).find('.offscreen');
        var btnBeforeText = btnChangeTextTarget.text();
        $(target)
            .toggleClass('active')
            .parents()
            .find(selector)
            .toggleClass('active');

        if ($(selector).hasClass('active')) {
            $(selector).attr('tabindex', -1).focus();

            if (Boolean(btnBeforeText.match('열기'))) {
                isMatch = true;
                btnAfterText = btnBeforeText.replace('열기', '닫기');
            }

        } else {
            $(selector).attr('tabindex', '');

            if (Boolean(btnBeforeText.match('닫기'))) {
                isMatch = true;
                btnAfterText = btnBeforeText.replace('닫기', '열기');
            }
        }
        if ( isMatch == true && btnChangeTextTarget.length > 0 & Boolean(btnBeforeText.match('열기')) || Boolean(btnBeforeText.match('닫기'))) {
            btnChangeTextTarget.text(btnAfterText);
        }
    }


    /**
    * date : 20220800
    * last : 20220800
    * name : setSwiperNoticePopup()
    * @param wrap {string} 실행 대상 element
    * desc : 공통 팝업 - 알림 팝업 스와이퍼 셋팅 (jquery)
    */
    function setSwiperNoticePopup(selector) {
        selector = selector || '.swiper-notice-history';
        if ($(selector).length > 0) {
            var swiperNoticeHistory;
            swiperNoticeHistory = new Swiper($('.swiper-notice-history'), {
                init: false,
                speed: 250,
                slidesPerView: 1,
                spaceBetween: 0,
                resistance: '100%', // swiper bounce 제거
                resistanceRatio: 0, // swiper bounce 제거
                touchRatio: 0.3,
                observer: true,
                observeParents: true,
                autoHeight: true,
                loop: true,
                on: {
                    init: function () {
                        $('.notice-history-popup').find('.tab-wrap .tab-content').show();

                        $('.tab-wrap').on('click', '.tab-item', function () {
                            var selectedTabIndex = $(this).index();
                            swiperNoticeHistory.slideTo(selectedTabIndex + 1);
                        });

                    },
                    slideChange: function () {
                        var activeNum = this.activeIndex;
                        if (activeNum > 3) activeNum = 1
                        $('.notice-history-popup').find('.tab-wrap').tabs('option', 'active', activeNum - 1);

                    }
                }
            });
            swiperNoticeHistory.init();
        }
    }

    /**
    * date : 20220800
    * last : 20220800
    * name : setSwiperMainPopup()
    * @param wrap {string} 실행 대상 element
    * desc : 공통 팝업 - 메인 팝업 스와이퍼 셋팅 (jquery)
    */
    function setSwiperMainPopup(selector) {
        selector = selector || '.swiper-main-popup';

        if ($('.swiper-slide', selector).length > 1) {
            $('.swiper-main-popup').addClass('is-active');
            var swiperMainPopup;
            swiperMainPopup = new Swiper($('.swiper-main-popup'), {
                init: false,
                speed: 250,
                slidesPerView: 1,
                spaceBetween: 0,
                resistance: '100%', // swiper bounce 제거
                resistanceRatio: 0, // swiper bounce 제거
                touchRatio: 0.3,
                observer: true,
                observeParents: true,
                pagination: {
                    el: '.swiper-main-popup .swiper-pagination',
                    type: 'fraction',
                },
                navigation: {
                    nextEl: '.swiper-main-popup .swiper-button-next',
                    prevEl: '.swiper-main-popup .swiper-button-prev',
                },
                loop: true,
            });
            swiperMainPopup.init();
        }

    }
    /* 슬라이드 팝업추가 */
    function setSwiperSlidePopup(selector) {
        selector = selector || '.swiper-slide-popup';

        if ($('.swiper-slide', selector).length > 1) {
            $('.swiper-slide-popup').addClass('is-active');
            var setSwiperSlidePopup;
            setSwiperSlidePopup = new Swiper($('.swiper-slide-popup'), {
                init: false,
                speed: 250,
                slidesPerView: 1,
                spaceBetween: 50,
                resistance: '100%', // swiper bounce 제거
                resistanceRatio: 0, // swiper bounce 제거
                touchRatio: 0.3,
                observer: true,
                observeParents: true,
                pagination: {
                    el: '.swiper-slide-popup .swiper-pagination' 
                },
                navigation: {
                    nextEl: '.swiper-slide-popup .swiper-button-next',
                    prevEl: '.swiper-slide-popup .swiper-button-prev',
                },
            });
            setSwiperSlidePopup.init();
        }

    }
    /**
    * date : 20220824
    * last : 20220824
    * name : listItemSwiper()
    * @param selector {string} 실행 대상 element
    * @param selector {string} 실행 대상 element
    * desc : 공통 팝업 - 리스트 아이템 스와이퍼 셋팅 (jquery)
    */
    function listItemSwiper(selector, count, isHeight) {
        /*selector = selector || '.swiper-prod-wrap';*/
        var swiper = [];
        count = count || 2;
        if( $(selector).length === 0 ) return false;
        $(selector).each(function (i) {swiperInit($(this), i);});

        $(window).on('resize orientationchange observerUpdate', function() {
            $(selector).each(function (i) {swiperInit($(this), i);});
        });


        function swiperInit(wrap, idx) {
            var dataOpt = {};
            if( swiper[idx] !== undefined ) {
                swiper[idx].destroy();
                swiper[idx] = undefined;
            }

            if( isHeight !== undefined && isHeight && $('.swiper-wrapper', wrap).outerHeight() > 0 ) $('.swiper-wrapper', wrap).css('height', $('.swiper-wrapper', wrap).outerHeight() + 'px');

            if( $('.swiper-slide', wrap).length > 1 && _sizeViewSta === 'mobile' ) {
                wrap.addClass('is-active');
                dataOpt.centeredSlides = true;
                dataOpt.loop = true;
                dataOpt.slideInx = 0;
            }
            else if( $('.swiper-slide', wrap).length >= count && _sizeViewSta === 'desktop' ) {
                wrap.addClass('is-active');
                dataOpt.centeredSlides = false;
                dataOpt.loop = false;
                dataOpt.slideInx = 0;
            }
            else {
                if( wrap.hasClass('is-active') ) wrap.removeClass('is-active');
                return false;
            }

            swiper[idx] = new Swiper($('.swiper-container', wrap), {
                init: false,
                slidesPerView: 'auto',
                speed: 250,
                autoHeight: false,
                navigation: {
                    nextEl: $('.swiper-button-next', wrap),
                    prevEl: $('.swiper-button-prev', wrap),
                },
                pagination: {
                    el: $('.swiper-pagination', wrap),
                    type: 'fraction'
                },
                resistance: '100%', // swiper bounce 제거
                resistanceRatio: 0, // swiper bounce 제거
                updateOnWindowResize: true,
                //touchRatio: 0.3,
                observer: true,
                observeParents: true,
                breakpoints: {
                    // when window width is >= 320px
                    980: {
                        navigation: {
                            enabled: true
                        }
                    },
                }
            });
            swiper[idx].init();
        }
    }

    /**
     * date : 20220901
     * last : 20220901
     * name : setTooltipOnOff()
     * tooltip : hover type on off
     * @param container tooltip 컨테이너 영역 DOM 셀렉터 (default : .tooltip_wrap)
     */
    function setTooltipOnOff(container) {
        container = container || '.tooltip-wrap';

        if ($(container).length > 0) {
            $(container).each(function () {
                var that,
                    isToggle;
                that = $(this);

                that.find('.btn-info').on('click', function () {
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

                            //모바일이고 right 옵션 없을때 화면 왼쪽 기준으로 맞춘다
                            if (_sizeViewSta === 'mobile' && !that.hasClass('right')) {
                                $(that).find('.tooltip-box').css('left', - that.offset().left + 20);
                            }
                        }
                        return;
                    }

                    if (that.hasClass('active')) return;
                    $('.tooltip-wrap.active').removeClass('active').addClass('hide');
                    that.removeClass('hide').addClass('active');
                });

                if (!isToggle) {
                    $(this).find('.btn-tooltip-close').on('click', function () {
                        that.removeClass('active').addClass('hide');
                    });
                }

                $(window).on('resize, scroll', function(){
                    $('.tooltip-wrap').removeClass('active');
                });

                $(this).on(_transitionEnd, function () {
                    $(this).removeClass('hide');
                });
            });
        }
    }

    /**
     * date : 20220901
     * last : 20220901
     * name : debounce()
     * pram :
     *        @param func {function} 실행 함수
     *        @param wait {number} 시간 지정 ( 지정 시간 지난 후 함수 실행 )
     * desc : 지정 시간 끝난 후 함수 실행
     * ex) $contWrap.on('scroll',eatzPub.front.debounce(test, 400));
     */
    function debounce(func, wait) {
        var inDebounce;
        return function() {
            const context = this;
            const args = arguments;
            // setTimeout이 실행된 Timeout의 ID를 반환하고, clearTimeout()으로 이를 해제할 수 있음을 이용
            clearTimeout(inDebounce);

            inDebounce = setTimeout(() => func.apply(context, args), wait);
        };
    }

    /**
     * date : 20221019
     * last : 20221019
     * name : barcodeCategoryOnOff()
     * pram : X
     */
    function barcodeCategoryOnOff() {
        var wrap = $('.barcode-category-wrap');
        var control = {
            on: function (tg) {
                $('.time-instant-box', wrap).removeClass('is-active');
                $('.' + $(tg).data('show-content'), wrap).addClass('is-active');
                $(tg).prop('checked', true);
            },
            off: function (tg) {
                $('.' + $(tg).data('show-content'), wrap).removeClass('is-active');
                $(tg).prop('checked', false);
            },
        }

        return control;

    }

    /*
    * date : 20230524
    * last : 20230524
    * name : setIOSBottomPadding()
    * desc : set mobile docker Padding (IOS)
    */
    function setIOSBottomPadding() {
        // IOS 캡처방지 적용 이후 padding-bottom 0 이슈
        if (isAgentChk() == 'IOS' && checkAppVersion('1.6.1')) {
            if (!localStorage.getItem('IOSBottomPadding')) {
                window.webkit.messageHandlers.getBottomPadding.postMessage("");
            }

            const padding = localStorage.getItem('IOSBottomPadding') || 0;
            document.documentElement.style.setProperty('--IOSBottomPadding', padding +'px');
        }
    }

    const accessControlAlert = async (acMsg) => {
        if (!acMsg) return;
        await createAlert(acMsg);
    }

    const hideContents = async (contentTypeLi) => {
        if (!contentTypeLi || contentTypeLi.length == 0) return;

        for (const type of contentTypeLi) {
            contentLi = document.querySelectorAll(`[content-type="${type}"]`);
            for (const $content of contentLi) {
                $content.remove();

                if (type == contentType.COUPON && typeof cpnClspCode !== "undefined" && cpnClspCode === cpnClspCodeType.MOBILE) {
                    cpnClspCode = cpnClspCodeType.PAPER;
                }
            }
        }
    }

    _front.breakpointChangeInit = breakpointChangeInit;
    _front.setPrependZero = setPrependZero;
    _front.setTabs = setTabs;
    _front.setUIDialog = setUIDialog;
    _front.setUISpinner = setUISpinner;
    _front.setFoldBox = setFoldBox;
    _front.dialogOnOff = dialogOnOff;
    _front.blockPop = blockPop;
    _front.isAllowDisplayPop = isAllowDisplayPop;
    _front.setSpsOffsetData = setSpsOffsetData;
    _front.contentScrollMove = contentScrollMove;
    _front.setAllCheckList = setAllCheckList;
    _front.setDatepicker = setDatepicker;
    _front.setTextareaFocus = setTextareaFocus;
    _front.setIpFocusBlur = setIpFocusBlur;
    _front.maxLengthCheck = maxLengthCheck;
    _front.setGateLayerOnOff = setGateLayerOnOff;
    _front.toastPopupActive = toastPopupActive;
    _front.toastPopupMessage = toastPopupMessage;
    _front.setInputStatus = setInputStatus;
    _front.setUISelect = setUISelect;
    _front.setSelectReInit = setSelectReInit;
    _front.callSelectRefresh = callSelectRefresh;
    _front.toggleOnOff = toggleOnOff;
    _front.toggleOffscreenOnOff = toggleOffscreenOnOff;
    _front.setTextareaStatus = setTextareaStatus;
    _front.setDesktopHeader = setDesktopHeader;
    _front.setMoAllmenu = setMoAllmenu;
    _front.listItemSwiper = listItemSwiper;
    _front.setDesktopAsideFixfooter = setDesktopAsideFixfooter;
    _front.popoverPopupActive = popoverPopupActive;
    _front.setTooltipOnOff = setTooltipOnOff;
    _front.foldTransition = foldTransition;
    _front.debounce = debounce;
    _front.barcodeCategoryOnOff = barcodeCategoryOnOff;
    _front.snsLinkLayer = snsLinkLayer;
    _front.callSelectDestroy = callSelectDestroy;
    _front.selectBreakpointInit = selectBreakpointInit;
    _front.setSwiperMainPopup = setSwiperMainPopup;
    _front.setSwiperSlidePopup = setSwiperSlidePopup;


    $(document).ready(async function () {
        $_btnGoTop = $('.btn-go-top');
        $_container = $('.container-wrapper');
        $_wrapper = $('.wrapper');


        _resizeVw = window.innerWidth || $(window).width() || document.body.clientWidth;

        breakpointChangeInit();
        setGoTop();
        setTableCaption();
        setDatepicker();
        setUIDialog();
        setTabs();
        selectBreakpointInit();
        setUISpinner();
        setAllCheckList();
        setTextareaFocus();
        //setIpFocusBlur();
        maxLengthCheck();
        setInputStatus();
        setTextareaStatus();
        setTogglePassword();
        setSwiperNoticePopup();
        setFoldBox();
        listItemSwiper('.swiper-prod-wrap', 7);
        listItemSwiper('.cont-body .swiper-prod-wrap', 5);
        listItemSwiper('.swiper-coupon-wrap', 7, true);
        listItemSwiper('.swiper-coupon-box-wrap', 4, true);
        listItemSwiper('.swiper-store-banner', 5);
        setTooltipOnOff();
        barcodeCategoryOnOff();

        /* 맥 OS 또는 iOS / android 디바이스 체크 */
        _isIos = /(iPhone|iPod|iPad)/i.test(navigator.platform);
        _isMac = /(Mac)/i.test(navigator.platform);
        _isAndroid = /Android/i.test(navigator.userAgent);


        if (_isIos) {
            _vh = getBodyHeight * 0.01;
            _resizeVh = getBodyHeight * 0.01;
            setPropertyVh();
            $('body').addClass('ios');
        }
        if (_isMac) {
            _vh = getBodyHeight * 0.01;
            _resizeVh = getBodyHeight * 0.01;
            setPropertyVh();
            $('body').addClass('mac');
        }
        if (_isAndroid) {
            _vh = window.outerHeight;
            _resizeVh = window.outerHeight;
            setPropertyVh();
            $('body').addClass('android');
        } else {
            _vh = window.innerHeight;
            _resizeVh = window.innerHeight;
            setPropertyVh();
        }


        // 회전변경 이벤트 발생 시 : 100vh 스타일 지정
        $(window).on('resize orientationchange observerUpdate', function () {
            _resizeVh = window.outerHeight;
            _resizeVw = window.innerWidth || $(window).width() || document.body.clientWidth;
            _scrollTop = $(window).scrollTop();
            breakpointChangeInit();
            openSelectClose();
            selectBreakpointInit();

            if (_isIos && _isMac) {
                _resizeVh = getBodyHeight * 0.01;
                setPropertyVh();
            }
            if (_isAndroid) {
                _resizeVh = window.outerHeight;
                setPropertyVh();
            } else {
                _resizeVh = window.innerHeight;
                setPropertyVh();
            }

            if ($(".ui-dialog-container:visible").length > 0) {
                $(".ui-dialog-container:visible").each(function (i) {
                    if ($('.ui-dialog-content', this).data('mobile-popup') !== undefined && _sizeViewSta === 'desktop') {
                        dialogOnOff().popClose('#' + $('.ui-dialog', this).attr('aria-describedby'));
                    } else if ($('.ui-dialog-content', this).data('pc-popup') !== undefined && _sizeViewSta === 'mobile') {
                        dialogOnOff().popClose('#' + $('.ui-dialog', this).attr('aria-describedby'));
                    }
                });
            }

            if ($(".ui-datepicker:visible").length > 0) {
                $('.date-box input').datepicker('hide');
            }

            if( _sizeViewSta === 'desktop' && $('body').hasClass('dialog-open') ) {
                $('body').css({width: _resizeVw});
            }
            else {
                $('body').css({width: '100%'});
            }

        });

        setMoHeader();
        setDesktopHeader();
        setSpsOffsetData();
        setDesktopAsideFixfooter();
        moContentDockerChange();
        setIOSBottomPadding();
        hideContents(_contentTypeLi);
        await accessControlAlert(_acMsg);
    });

    return _front;
})();

