export default function ({ route, redirect, i18n }) {
  const locale = i18n.locale
  if (route.fullPath === `/${locale}` || route.fullPath === `/${locale}/home` || route.fullPath === `${locale}/hnihome`) {
    redirect(`/${i18n.locale}/welcome`)
  }
}
