import { ClientConfigContributor } from './client_config_contributor.js';
import {
  UnifiedBackendOutput,
  graphqlOutputKey,
} from '@aws-amplify/backend-output-schemas';
import { GraphqlClientConfig } from '../client-config-types/graphql_client_config.js';
import { ModelIntrospectionSchemaAdapter } from './model_introspection_schema_adapater.js';

/**
 * Translator for the Graphql API portion of ClientConfig
 */
export class GraphqlClientConfigContributor implements ClientConfigContributor {
  /**
   * Constructor
   * @param modelIntrospectionSchemaAdapter the adapter to provide the model introspection schema from s3 uri
   */
  constructor(
    private readonly modelIntrospectionSchemaAdapter: ModelIntrospectionSchemaAdapter
  ) {}

  /**
   * Given some BackendOutput, contribute the Graphql API portion of the client config
   */
  contribute = async ({
    [graphqlOutputKey]: graphqlOutput,
  }: UnifiedBackendOutput): Promise<
    GraphqlClientConfig | Record<string, never>
  > => {
    if (graphqlOutput === undefined) {
      return {};
    }
    const config: GraphqlClientConfig = {
      aws_appsync_graphqlEndpoint: graphqlOutput.payload.awsAppsyncApiEndpoint,
      aws_appsync_region: graphqlOutput.payload.awsAppsyncRegion,
      aws_appsync_apiKey: graphqlOutput.payload.awsAppsyncApiKey,
      aws_appsync_authenticationType:
        graphqlOutput.payload.awsAppsyncAuthenticationType,
      aws_appsync_additionalAuthenticationTypes:
        graphqlOutput.payload.awsAppsyncAdditionalAuthenticationTypes,
      aws_appsync_conflictResolutionMode:
        graphqlOutput.payload.awsAppsyncConflictResolutionMode,
    };

    const modelIntrospection =
      await this.modelIntrospectionSchemaAdapter.getModelIntrospectionSchemaFromS3Uri(
        graphqlOutput.payload.amplifyApiModelSchemaS3Uri
      );

    if (modelIntrospection) {
      config.modelIntrospection = modelIntrospection;
    }

    return config;
  };
}
