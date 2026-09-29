import { defineWidgetConfig } from "@medusajs/admin-sdk";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";

export const config = defineWidgetConfig({
  zone: "login.after",
});

const RedirectWidget = () => {
  const [params, setParams] = useSearchParams();
  const redirectTo = params.get("ref");
  const location = useLocation();
  const navigate = useNavigate();
  if (redirectTo) {
    navigate(location.pathname, {
      replace: true,
      state: {
        from: {
          pathname: redirectTo,
        },
      },
    });
  }

  return <></>;
};

export default RedirectWidget;
