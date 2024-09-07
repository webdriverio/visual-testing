import Image from "next/image";
import styles from "./LoadingContainer.module.css";

const LoadingContainer = () => {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Image
          src="/static/img/logo-webdriver-io.png"
          alt="WebdriverIO Visual Report"
          width={50}
          height={50}
        />
        <h1>Visual Report</h1>
      </div>
      <p className={styles.text}>Please wait while we create your report.</p>
      <ul>
        <li className={styles.text}>Fetching data...</li>
        <li className={styles.text}>Sorting data...</li>
        <li className={styles.text}>Attaching thumbnails...</li>
        <li className={styles.text}>Attaching snapshots...</li>
        <li className={styles.text}>Stitching it all together...</li>
      </ul>
    </div>
  );
};

export default LoadingContainer;
