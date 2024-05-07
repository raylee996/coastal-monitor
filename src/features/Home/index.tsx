import styles from "./index.module.sass";
import { Outlet } from "react-router-dom";

import HomeHeader from "./components/HomeHeader";


const Home: React.FC = () => {
  console.debug('Home')


  return (
    <article className={styles.wrapper}>
      <section className={styles.content}>
        <Outlet />
      </section>
      <footer className={styles.header}>
        <HomeHeader />
      </footer>
    </article>
  );
}

export default Home;
