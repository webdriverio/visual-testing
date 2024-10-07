import SelectHeader from "./SelectHeader";
import styles from "./Header.module.css";
import { SelectedOptions, SnapshotInstanceData } from "../types";
import logo from "../images/logo-webdriver-io.png";

const Header = ({
  handleSelectedOptions,
  instanceData,
}: {
  handleSelectedOptions: (
    selectedOptions: string[] | keyof SelectedOptions | string,
    type: string
  ) => void;
  instanceData: SnapshotInstanceData;
}) => {
  return (
    <nav className={styles.navbarContainer}>
      <div className={styles.navbarInner}>
        <div className={styles.navbarItems}>
          <div className={styles.navbarBrand}>
            <img
              src={logo}
              alt="WebdriverIO Visual Report"
              width={50}
              height={50}
            />
          </div>
          <h1>Visual Report</h1>
          <SelectHeader
            handleSelectedOptions={handleSelectedOptions}
            instanceData={instanceData as SnapshotInstanceData}
          />
        </div>
      </div>
    </nav>
  );
};

export default Header;
