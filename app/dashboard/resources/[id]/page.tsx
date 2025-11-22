import { ResourceDetail } from "@/components/dashboard/resource-detail"

export default function ResourceDetailPage({
  params,
}: {
  params: { id: string }
}) {
  return <ResourceDetail id={params.id} />
}








