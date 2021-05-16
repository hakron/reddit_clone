import { ChevronDownIcon, ChevronUpIcon } from "@chakra-ui/icons";
import { Flex, IconButton } from "@chakra-ui/react";
import React, { useState } from "react";
import { useVoteMutation } from "../generated/graphql";

interface UpdootSectionProps {
  points: number;
  postId: number;
}

export const UpdootSection: React.FC<UpdootSectionProps> = ({
  points,
  postId,
}) => {
  const [loadingState, setLoadingState] =
    useState<"updoot-loading" | "downdoot-loading" | "not-loading">(
      "not-loading"
    );
  const [, vote] = useVoteMutation();
  return (
    <Flex direction="column" justifyContent="center" alignItems="center">
      <IconButton
        onClick={async () => {
          setLoadingState("updoot-loading");
          await vote({
            value: 1,
            postId,
          });
          setLoadingState("not-loading");
        }}
        isLoading={loadingState === "updoot-loading"}
        colorScheme="green"
        aria-label="Updoot post"
        icon={<ChevronUpIcon />}
      />
      {points}
      <IconButton
        onClick={async () => {
          setLoadingState("downdoot-loading");
          await vote({
            value: -1,
            postId,
          });

          setLoadingState("not-loading");
        }}
        isLoading={loadingState === "downdoot-loading"}
        colorScheme="red"
        aria-label="Downdoot post"
        icon={<ChevronDownIcon />}
      />
    </Flex>
  );
};
