-- Let organization owners recover onboarding state after a partial setup.
DROP POLICY IF EXISTS organizations_select_members ON public.organizations;
CREATE POLICY organizations_select_members ON public.organizations
  FOR SELECT TO authenticated
  USING (owner_user_id = (SELECT auth.uid()) OR is_org_member(id, (SELECT auth.uid())));

-- New organizations may only create the default free subscription from the client.
DROP POLICY IF EXISTS subscriptions_insert_free_owner ON public.subscriptions;
CREATE POLICY subscriptions_insert_free_owner ON public.subscriptions
  FOR INSERT TO authenticated
  WITH CHECK (
    plan = 'free'
    AND status = 'active'
    AND provider IS NULL
    AND external_customer_id IS NULL
    AND external_subscription_id IS NULL
    AND EXISTS (
      SELECT 1
      FROM public.organizations AS organization
      WHERE organization.id = organization_id
        AND organization.owner_user_id = (SELECT auth.uid())
    )
  );
