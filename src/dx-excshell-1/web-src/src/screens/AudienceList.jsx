import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Heading,
  View,
  Button,
  ProgressCircle,
  Text,
  TableView,
  TableHeader,
  Column,
  TableBody,
  Row,
  Cell,
} from "@adobe/react-spectrum";

import actions from "../config.json";
import actionWebInvoke from "../utils";

export default function AudienceList({ ims }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [audiences, setAudiences] = useState([]);

  // Hardcode for now (later: make this a UI setting)
  const sandboxName = "YOUR_SANDBOX_NAME";

  const headers = useMemo(() => {
    const h = {};
    if (ims?.token) h.authorization = `Bearer ${ims.token}`; // <-- must be lowercase key
    if (ims?.org) h["x-gw-ims-org-id"] = ims.org;
    h["x-sandbox-name"] = sandboxName;
    return h;
  }, [ims, sandboxName]);

  const loadAudiences = useCallback(async () => {
    setLoading(true);
    setError(null);

    // Diagnostic logs (temporary)
    console.log("IMS object:", ims);
    console.log("Has ims.token?:", Boolean(ims?.token));
    console.log("Action URL:", actions["audiences-list"]);
    console.log("Headers being sent:", headers);

    try {
      // Call as GET (cleaner for a list endpoint)
      const resp = await actionWebInvoke(
        actions["audiences-list"],
        headers,
        { limit: 200 },
        { method: "GET" }
      );

      // Robustly handle either response shape:
      // - { body: { audiences: [...] } } (if your action uses App Builder style)
      // - { audiences: [...] } (if your action returns body directly)
      const list = resp?.body?.audiences || resp?.audiences || [];
      setAudiences(Array.isArray(list) ? list : []);
    } catch (e) {
      setError(e.message || String(e));
      setAudiences([]);
    } finally {
      setLoading(false);
    }
  }, [headers, ims]);

  useEffect(() => {
    loadAudiences();
  }, [loadAudiences]);

  return (
    <View>
      <Heading level={2}>Audiences</Heading>

      <Button variant="cta" onPress={loadAudiences} isDisabled={loading}>
        Refresh
      </Button>

      {loading && (
        <View marginTop="size-200">
          <ProgressCircle aria-label="Loading" isIndeterminate />
        </View>
      )}

      {error && (
        <Text marginTop="size-200" UNSAFE_style={{ color: "red" }}>
          {error}
        </Text>
      )}

      <View marginTop="size-200">
        <TableView aria-label="Audiences table" selectionMode="none">
          <TableHeader>
            <Column>Name</Column>
            <Column>Namespace</Column>
            <Column>Lifecycle</Column>
            <Column>Updated</Column>
            <Column>ID</Column>
          </TableHeader>
          <TableBody>
            {audiences.map((a) => (
              <Row key={a.id}>
                <Cell>{a.name || "(no name)"}</Cell>
                <Cell>{a.namespace || ""}</Cell>
                <Cell>{a.lifecycleState || ""}</Cell>
                <Cell>
                  {a.updateTime ? new Date(a.updateTime).toLocaleString() : ""}
                </Cell>
                <Cell style={{ fontFamily: "monospace" }}>{a.id}</Cell>
              </Row>
            ))}
          </TableBody>
        </TableView>
      </View>

      <Text marginTop="size-200">Showing {audiences.length} audiences.</Text>
    </View>
  );
}
