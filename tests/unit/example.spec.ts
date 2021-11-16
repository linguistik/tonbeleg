import { mount } from '@vue/test-utils';
import i18n from '@/translations';
import Tab1 from '@/views/Tab1.vue';
import Tab2 from '@/views/Tab2.vue';
import Tab3 from '@/views/Tab3.vue';

import TabDataProtection from '@/views/TabDataProtection.vue';
import TabImprint from '@/views/TabImprint.vue';
import TabPersonalData from '@/views/TabPersonalData.vue';
import TabSettings from '@/views/TabSettings.vue';

describe('Tab1.vue', () => {
  it('renders tab 1 view', () => {
    const wrapper = mount(Tab1, {global: {plugins: [i18n]}})
    expect(wrapper.text()).toMatch('Tab 1 page')
  })
})

describe('Tab2.vue', () => {
  it('renders tab 2 view', () => {
    const wrapper = mount(Tab2, {global: {plugins: [i18n]}})
    expect(wrapper.text()).toMatch('Tab 2 page')
  })
})
describe('Tab3.vue', () => {
  it('renders tab 3 view', () => {
    const wrapper = mount(Tab3, {global: {plugins: [i18n]}})
    expect(wrapper.text()).toMatch('Tab 3 page')
  })
})
//////////////////////////////////////////////////////

describe('TabDataProtection.vue', () => {
  it('renders TabDataProtection view', () => {
    const wrapper = mount(TabDataProtection, {global: {plugins: [i18n]}})
    expect(wrapper.text()).toMatch('Datenschutz')
  })
})

describe('TabPersonalData.vue', () => {
  it('renders TabPersonalData view', () => {
    const wrapper = mount(TabPersonalData, {global: {plugins: [i18n]}})
    expect(wrapper.text()).toMatch('Personal Data')
  })
})

describe('TabImprint.vue', () => {
  it('renders TabImprint view', () => {
    const wrapper = mount(TabImprint, {global: {plugins: [i18n]}})
    expect(wrapper.text()).toMatch('Impressum')
  })
})

describe('TabSettings.vue', () => {
  it('renders TabSettings view', () => {
    const wrapper = mount(TabSettings, {global: {plugins: [i18n]}})
    expect(wrapper.text()).toMatch('Settings')
  })
})