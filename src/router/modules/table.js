/** When your routing table is too long, you can split it into small modules **/

import Layout from '@/layout'

const tableRouter = {
  path: '/table',
  component: Layout,
  redirect: '/table/complex-table',
  name: 'Table',
  meta: {
    title: '数据管理',
    icon: 'table'
  },
  children: [
    {
      path: 'complex-table',
      component: () => import('@/views/table/complex-table'),
      name: 'ComplexTable',
      meta: { title: '收支情况' }
    },
    {
      path: 'complex-table1',
      component: () => import('@/views/table/complex-table1'),
      name: 'ComplexTable1',
      meta: { title: '家庭成员' }
    },
    {
      path: 'complex-table2',
      component: () => import('@/views/table/complex-table2'),
      name: 'ComplexTable2',
      meta: { title: '账号管理' }
    }
  ]
}
export default tableRouter
