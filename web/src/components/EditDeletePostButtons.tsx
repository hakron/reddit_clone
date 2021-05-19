import { DeleteIcon, EditIcon } from "@chakra-ui/icons";
import { Box, IconButton, Link } from "@chakra-ui/react";
import NextLink from "next/link";
import React from "react";
import { useDeletePostMutation, useMeQuery } from "../generated/graphql";

interface EditDeletePostButtonsProps {
  id: number;
  creatorId: number;
}

export const EditDeletePostButtons: React.FC<EditDeletePostButtonsProps> = ({
  id,
  creatorId,
}) => {
  const [{ data }] = useMeQuery();
  const [, deletePost] = useDeletePostMutation();

  if (data?.me?.id !== creatorId) {
    return null;
  }
  return (
    <Box>
      <NextLink href="/post/edit/[id]" as={`/post/edit/${id}`}>
        <IconButton
          as={Link}
          mr={4}
          colorScheme="teal"
          aria-label="Edit post"
          icon={<EditIcon />}
        />
      </NextLink>
      <IconButton
        onClick={() => deletePost({ id })}
        colorScheme="red"
        aria-label="Delete post"
        icon={<DeleteIcon />}
      />
    </Box>
  );
};
