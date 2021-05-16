import { Button, Flex, Spinner } from "@chakra-ui/react";
import { withUrqlClient } from "next-urql";
import React, { useState } from "react";
import { Layout } from "../components/Layout";
import { PostSection } from "../components/PostSection";
import { usePostsQuery } from "../generated/graphql";
import { createUrqlClient } from "../utils/createUrqlClient";
const Index = () => {
  const [variables, setVariables] = useState({
    limit: 10,
    cursor: null as null | string,
  });
  const [{ data, fetching }] = usePostsQuery({ variables });
  if (!fetching && !data) {
    return <div> query failed</div>;
  }
  return (
    <Layout>
      {fetching && !data ? (
        <Spinner
          thickness="4px"
          speed="0.65s"
          emptyColor="gray.200"
          color="blue.500"
          size="xl"
        />
      ) : (
        //data! === data always exist
        <PostSection posts={data!.posts.posts} />
      )}
      {data && data.posts.hasMore && (
        <Flex>
          <Button
            onClick={() =>
              setVariables({
                limit: variables.limit,
                //last element in the data.post
                cursor: data.posts.posts[data.posts.posts.length - 1].createdAt,
              })
            }
            isLoading={fetching}
            m="auto"
            my={8}
          >
            Load More
          </Button>
        </Flex>
      )}
    </Layout>
  );
};

export default withUrqlClient(createUrqlClient, { ssr: true })(Index);
