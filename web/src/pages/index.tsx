import { withUrqlClient } from "next-urql";
import { Navbar } from "../components/Navbar";
import { usePostsQuery } from "../generated/graphql";
import { createUrqlClient } from "../utils/createUrqlCLient";

const Index = () => {
  const [{data}] = usePostsQuery()
  return (
  <>
    <Navbar />
    <div>Hello World</div>
    {!data ? null : data.posts.map((p => <div key={p.id}>{p.title}</div>))}
  </>
  )
}

export default withUrqlClient(createUrqlClient)(Index)
