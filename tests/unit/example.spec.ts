import { mount } from '@vue/test-utils';
import i18n from '@/translations';
import TabSaved from '@/views/TabSaved.vue';
import TabRecord from '@/views/TabRecord.vue';
import TabAccount from '@/views/TabAccount.vue';

import TabDataProtection from '@/views/TabDataProtection.vue';
import TabImprint from '@/views/TabImprint.vue';
import TabPersonalData from '@/views/TabPersonalData.vue';
import TabSettings from '@/views/TabSettings.vue';

describe('TabSaved.vue', () => {
  it('renders tab saved view', () => {
    const wrapper = mount(TabSaved, {global: {plugins: [i18n]}})
    expect(wrapper.text()).toMatch('Gespeicherte Dateien')
  })
})

//TODO implement test
/*
describe('TabRecord.vue', () => {
  it('renders tab record view', () => {
    const wrapper = mount(TabRecord, {global: {plugins: [i18n]}})
    expect(wrapper.text()).toMatch('Aufnahme')
  })
})*/

describe('TabAccount.vue', () => {
  it('renders tab 3 view', () => {
    const wrapper = mount(TabAccount, {global: {plugins: [i18n]}})
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
    expect(wrapper.text()).toMatch('Persönliche Daten')
  })
})

describe('TabImprint.vue', () => {
  it('renders TabImprint view', () => {
    const wrapper = mount(TabImprint, {global: {plugins: [i18n]}})
    expect(wrapper.text()).toMatch('Impressum Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet.')
  })
})

describe('TabSettings.vue', () => {
  it('renders TabSettings view', () => {
    const wrapper = mount(TabSettings, {global: {plugins: [i18n]}})
    expect(wrapper.text()).toMatch('Settings')
  })
})