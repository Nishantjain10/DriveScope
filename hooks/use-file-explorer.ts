// REFACTORED: This file now re-exports the refactored hook for backward compatibility
// The original monolithic hook (1031 lines) has been broken down into 7 specialized hooks:
// - use-file-state.ts - manages file state
// - use-navigation-state.ts - manages navigation state  
// - use-file-operations.ts - handles API operations
// - use-file-selection.ts - manages file selection logic
// - use-file-navigation.ts - handles folder navigation
// - use-file-utils.ts - provides utility functions
// - use-file-filters.ts - handles filtering and sorting
//
// The new architecture follows SOLID principles and React best practices:
// ✅ Single Responsibility Principle - each hook has one clear purpose
// ✅ Open/Closed Principle - easy to extend without modifying existing code
// ✅ Interface Segregation - focused interfaces for specific use cases
// ✅ Dependency Inversion - depends on abstractions, not concrete implementations
// ✅ Liskov Substitution - maintains the same interface for backward compatibility
//
// This approach ensures:
// - Zero breaking changes for existing components
// - Improved maintainability and testability
// - Better separation of concerns
// - Easier debugging and feature development
// - Reduced complexity from 1031 lines to manageable, focused modules

export { useFileExplorerRefactored as useFileExplorer } from './use-file-explorer-refactored';
