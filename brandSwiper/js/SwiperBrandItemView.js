class SwiperBrandItemView extends View {
  template() {
    return html `
    <li class="swiper-slide">
      ${new SwiperBrandItemView({brandCode: this.data.brandCode}).template()}
    </li>`
  }
}