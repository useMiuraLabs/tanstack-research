// route の定義

import { createFileRoute, Link } from '@tanstack/react-router'
import { z } from 'zod'

const echoSearchSchema = z.object({
  q: z.string().default('').catch(''),
  pageCatch: z.number().min(1).catch(1),
  pageDefault: z.number().min(1).default(1),
  debug: z.string().catch(''),
  sort: z.enum(['ASC', 'DESC']).catch('ASC'),
  tags: z.string().array().catch([]),
})

export const Route = createFileRoute('/echo')({
  validateSearch: echoSearchSchema,
  loaderDeps: ({ search }) => ({
    q: search.q,
    pageCatch: search.pageCatch,
    pageDefault: search.pageDefault,
    tags: search.tags,
  }),
  loader: ({ deps }) => {
    return { ...deps, fetchedAt: Date.now() }
  },
  component: Echo,
  errorComponent: () => {
    return <div>error です</div>
  },
})

function Echo() {
  const params = Route.useSearch()
  const navigate = Route.useNavigate()

  const res = Route.useLoaderData()

  const handleQueryChange = (input: string) => {
    return navigate({
      search: (prev) => ({ ...prev, q: input }),
      replace: true,
    })
  }
  return (
    <div>
      <input
        type="text"
        value={params.q}
        className=" outline m-3"
        onChange={(e) => {
          handleQueryChange(e.target.value)
        }}
      />
      <div>PARAMS: q:{params.q}</div>
      <div>PARAMS: page C:{params.pageCatch.toString()}</div>
      <div>PARAMS: page D:{params.pageDefault.toString()}</div>
      {params.tags.map((t) => (
        <div>PARAMS: tags: t: {t}</div>
      ))}
      <div>RES: q: {res.q}</div>
      <div>RES: page C: {res.pageCatch.toString()}</div>
      <div>RES: page D: {res.pageDefault.toString()}</div>
      {res.tags.map((r) => (
        <div>PARAMS: tags: t: {r}</div>
      ))}
      <div>fetch {res.fetchedAt}</div>
      <div>
        <div>
          <Link
            to="."
            from={Route.fullPath}
            search={(prev) => ({ ...prev, pageCatch: prev.pageCatch + 1 })}
          >
            page を進める（useSearch使用）
          </Link>
        </div>
        <div>
          <Link
            to="."
            from={Route.fullPath}
            search={(prev) => ({ ...prev, tags: ['test', 'test', 'test'] })}
          >
            tags を進める（useSearch使用）
          </Link>
        </div>
      </div>
    </div>
  )
}
