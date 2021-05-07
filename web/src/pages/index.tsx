import { withUrqlClient } from "next-urql";
import { Navbar } from "../components/Navbar";
import { createUrqlClient } from "../utils/createUrqlCLient";

const Index = () => (
  <>
    <Navbar />
    <div>Hello World</div>
  </>
);

export default withUrqlClient(createUrqlClient)(Index)
