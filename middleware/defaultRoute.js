export default function ({ route, redirect }) {
  if (route.fullPath === '/' || route.fullPath === '/home' || route.fullPath === '/hnihome') {
    redirect('/welcome')
  }
}
