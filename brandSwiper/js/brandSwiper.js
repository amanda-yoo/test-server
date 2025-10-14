document.addEventListener("DOMContentLoaded", () => {
  renderBrandList(brandCodes)
  createBrandSwiper()

  const elements = document.querySelectorAll('.brand-go-button');

  elements.forEach(element => {
    element?.addEventListener('click', (e) => {
      const brandName = e.currentTarget.dataset?.brandName || ''
      GA_Event('click_event', '브랜드_바로가기', brandName, brandName)
    });
  });
});

const brandSectionData = [[${brandSectionData}]]
const brandCodes = brandSectionData.mainBrand

const brandSwiperOptions = {
  init: false,
  loop: true,
  autoplay: {
    delay: 1500,
    disableOnInteraction: false,
  },
  spaceBetween: 20,
  slidesPerView: 5,
  centeredSlides: true,
  speed: 1000,
  navigation: {
    nextEl: '.brand-list-wrap .swiper-button-next',
    prevEl: '.brand-list-wrap .swiper-button-prev',
  },
  pagination: {
    el: '.brand-list-wrap .swiper-pagination',
    clickable: true,
  },
  breakpoints: {
    890: {
      slidesPerView: 'auto',
      spaceBetween: 12,
      autoplay: {
        delay: 1500,
        disableOnInteraction: false,
      },
    },
  },
  resistance: '100%', // swiper bounce 제거
  resistanceRation: 0, // swiper bounce 제거
  updateOnWindowResize: true,
  observer: true,
  observeParents: true,
}

function initializeSwiper(containerSelector, options){
  const swiperContainer = document.querySelector(containerSelector);
  if (!swiperContainer) {
    console.warn(`Swiper container not found: ${containerSelector}`);
    return null;
  }

  const swiperElement = swiperContainer.querySelector('.swiper-container');
  if (!swiperElement) {
    console.warn(`'.swiper-container' not found within ${containerSelector}`);
    return null;
  }

  // swiper 인스턴스 생성
  const swiperInstance = new swiper(swiperElement, options);
  swiperInstance.init();

  // container 활성화
  swiperContainer.classList.add('is-active');

  // device별 이벤트 핸들러 설정
  if (isTouchDevice()) {
    setupMobileAutoplay(swiperContainer, swiperInstance);
  } else {
    setupDesktopAutoplay(swiperContainer, swiperInstance);
  }

  return swiperInstance;
}

function setupDesktopAutoplay(element, swiper) {
  element.addEventListener('mouseenter', () => swiper.autoplay.stop());
  element.addEventListener('mouseleave', () => swiper.autoplay.start());
}

function setupMobileAutoplay(element, swiper) {
  element.addEventListener('touchend', () => {
    setTimeout(() => {
      if (swiper && !swiper.destroyed && swiper.autoplay) {
        swiper.autoplay.start();
      }
    }, 300);
  }, { passive: true });
}

// 터치 지원 여부 확인
function isTouchDevice() {
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
}

function createBrandSwiper() {
  initializeSwiper('.brand-list-wrap', brandSwiperOptions)
}

function renderBrandList(brandCodes = []) {
  const listWrapper = document.querySelector('.brand-list-container')
  brandCodes.forEach((brandCode) => {
    const brandView = new SwiperBrandItemView({brandCode})
    listWrapper.appendChild(brandView.render())
  })
}