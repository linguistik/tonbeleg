import { mount } from '@vue/test-utils';
import i18n from '@/translations';
import Tab2 from '@/views/Tab2.vue';

describe('Tab2.vue', () => {
  it('renders tab 2 view', () => {
    const wrapper = mount(Tab2, {global: {plugins: [i18n]}})
    expect(wrapper.text()).toMatch('Tab 2 page')
  })
})
