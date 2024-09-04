/** When your routing table is too long, you can split it into small modules**/

import Layout from '@/layout'

const chartsRouter = {
  path: '/charts',
  component: Layout,
  redirect: 'noRedirect',
  name: 'Charts',
  meta: {
    title: '数据统计',
    icon: 'chart'
  },
  children: [
    {
      path: 'mix-chart',
      component: () => import('@/views/charts/mix-chart'),
      name: 'MixChart',
      meta: { title: '每日收/支', noCache: true }
    },
    {
      path: 'data-all',
      component: () => import('@/views/charts/data-all'),
      name: 'DataAll',
      meta: { title: 'AI财务分析', noCache: true }
    }
  ]
}

export default chartsRouter
