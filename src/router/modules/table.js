/** When your routing table is too long, you can split it into small modules **/

import Layout from '@/layout'

const tableRouter = {
  path: '/table',
  component: Layout,
  redirect: '/table/complex-table',
  name: 'Table',
  meta: {
    title: '数据表',
    icon: 'table'
  },
  children: [
    {
      path: 'dynamic-table',
      component: () => import('@/views/table/dynamic-table/index'),
      name: 'DynamicTable',
      meta: { title: 'Dynamic Table' }
    },
    {
      path: 'drag-table',
      component: () => import('@/views/table/drag-table'),
      name: 'DragTable',
      meta: { title: 'Drag Table' }
    },
    {
      path: 'inline-edit-table',
      component: () => import('@/views/table/inline-edit-table'),
      name: 'InlineEditTable',
      meta: { title: 'Inline Edit' }
    },
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
