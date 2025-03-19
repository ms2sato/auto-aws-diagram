#!/usr/bin/env node

import { Command } from 'commander';
import { readFileSync } from 'fs';
import path from 'path';
import { AwsConfig } from './utils/aws-client';
import { ResourceCollector, ResourceCollectorConfig } from './services/resource-collector';
import { SvgGenerator, SvgOptions } from './services/svg-generator';
import { generateDemoSvg } from './demo';

// package.jsonからバージョンを取得
let packageJson = { version: '0.1.0' };
try {
  const packageJsonPath = path.resolve(__dirname, '../package.json');
  packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
} catch (error) {
  console.error('Warning: Could not read package.json', error);
}

const program = new Command();

program
  .name('auto-aws-diagram')
  .description('Automatically generate AWS architecture diagrams')
  .version(packageJson.version);

program
  .command('generate')
  .description('Generate an AWS architecture diagram from your AWS account')
  .option('-p, --profile <profile>', 'AWS profile to use')
  .option('-r, --region <region>', 'AWS region to scan', 'us-east-1')
  .option('-o, --output <file>', 'Output SVG file path', 'aws-architecture.svg')
  .option('-t, --resource-types <types>', 'Comma-separated list of resource types to include')
  .option('-w, --width <width>', 'SVG width in pixels', '1200')
  .option('-h, --height <height>', 'SVG height in pixels', '800')
  .action(async (options) => {
    try {
      console.log('Collecting AWS resources...');
      
      const awsConfig: AwsConfig = {
        profile: options.profile,
        region: options.region
      };
      
      const resourceCollectorConfig: ResourceCollectorConfig = {
        awsConfig,
        resourceTypes: options.resourceTypes ? options.resourceTypes.split(',') : undefined
      };
      
      const resourceCollector = new ResourceCollector(resourceCollectorConfig);
      const collectedResources = await resourceCollector.collectResources();
      
      console.log(`Collected ${collectedResources.resources.length} resources and ${collectedResources.connections.length} connections`);
      
      const svgOptions: SvgOptions = {
        width: parseInt(options.width),
        height: parseInt(options.height)
      };
      
      const svgGenerator = new SvgGenerator(svgOptions);
      svgGenerator.generateSvg(
        collectedResources.resources,
        collectedResources.connections,
        options.output
      );
      
      console.log(`Architecture diagram successfully generated: ${options.output}`);
    } catch (error) {
      console.error('Error generating architecture diagram:', error);
      process.exit(1);
    }
  });

program
  .command('demo')
  .description('Generate a demo architecture diagram using sample data')
  .option('-o, --output <file>', 'Output SVG file path', 'aws-architecture-demo.svg')
  .action((options) => {
    try {
      generateDemoSvg(options.output);
      console.log(`Demo architecture diagram successfully generated: ${options.output}`);
    } catch (error) {
      console.error('Error generating demo diagram:', error);
      process.exit(1);
    }
  });

program.parse(process.argv); 